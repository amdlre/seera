import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SNDR_SEND_URL } from "@/lib/constants/mail";

const BASE_ENV = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  JWT_SECRET: "test-secret-that-is-at-least-32-characters",
  MAIL_FROM: "Seera <no-reply@mail.example.com>",
};

/** Re-imports the module so env.ts re-validates against the stubbed variables. */
async function loadSendMail(overrides: Record<string, string>) {
  for (const [key, value] of Object.entries({ ...BASE_ENV, ...overrides })) {
    vi.stubEnv(key, value);
  }
  vi.resetModules();
  return import("@/lib/mail/send-mail");
}

const mail = { to: "user@example.com", subject: "رمز الدخول", text: "123456" };

describe("sendMail via SNDR", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    // Keep the real SMTP settings from .env.local out of these cases.
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "");
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("posts the message with bearer auth", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "em_1" }), { status: 200 }));
    const { sendMail } = await loadSendMail({
      MAIL_PROVIDER: "sndr",
      SNDR_API_KEY: "sndr_test_key",
    });

    await sendMail(mail);

    const [url, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(url).toBe(SNDR_SEND_URL);
    expect(headers.get("Authorization")).toBe("Bearer sndr_test_key");
    expect(JSON.parse(String(init?.body))).toEqual({
      // ASCII display names are quoted rather than encoded.
      from: '"Seera" <no-reply@mail.example.com>',
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
    });
  });

  it("throws a MailDeliveryError carrying SNDR's error code", async () => {
    const body = { error: { code: "domain_not_verified", message: "verify first" } };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status: 403 }));
    const { sendMail } = await loadSendMail({ MAIL_PROVIDER: "sndr", SNDR_API_KEY: "k" });

    await expect(sendMail(mail)).rejects.toMatchObject({
      name: "MailDeliveryError",
      message: "SNDR 403 domain_not_verified: verify first",
    });
  });

  it("still fails cleanly when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("Bad Gateway", { status: 502 }));
    const { sendMail } = await loadSendMail({ MAIL_PROVIDER: "sndr", SNDR_API_KEY: "k" });

    await expect(sendMail(mail)).rejects.toThrow("SNDR 502");
  });

  it("refuses to boot with MAIL_PROVIDER=sndr but no API key", async () => {
    await expect(loadSendMail({ MAIL_PROVIDER: "sndr", SNDR_API_KEY: "" })).rejects.toThrow(
      /SNDR_API_KEY is required/,
    );
  });

  it("refuses to boot with MAIL_PROVIDER=smtp but no SMTP host", async () => {
    await expect(loadSendMail({ MAIL_PROVIDER: "smtp" })).rejects.toThrow(/SMTP_HOST is required/);
  });
});
