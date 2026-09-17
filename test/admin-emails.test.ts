import { afterEach, describe, expect, it, vi } from "vitest";

const BASE_ENV = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  JWT_SECRET: "test-secret-that-is-at-least-32-characters",
  MAIL_FROM: "Seera <no-reply@mail.example.com>",
  MAIL_PROVIDER: "sndr",
  SNDR_API_KEY: "k",
};

/** Re-imports the module so the admin list is rebuilt from the stubbed env. */
async function loadWithAdminEmails(value: string) {
  for (const [key, val] of Object.entries(BASE_ENV)) vi.stubEnv(key, val);
  vi.stubEnv("ADMIN_EMAILS", value);
  vi.resetModules();
  return import("@/lib/auth/admin-emails");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isConfiguredAdminEmail", () => {
  it("matches a single configured address regardless of case", async () => {
    const { isConfiguredAdminEmail } = await loadWithAdminEmails("Owner@Example.com");
    expect(isConfiguredAdminEmail("owner@example.com")).toBe(true);
    expect(isConfiguredAdminEmail("  OWNER@EXAMPLE.COM  ")).toBe(true);
    expect(isConfiguredAdminEmail("someone@example.com")).toBe(false);
  });

  it("accepts a comma-separated list with stray spaces", async () => {
    const { isConfiguredAdminEmail } = await loadWithAdminEmails("a@x.com, b@y.com ,, c@z.com");
    for (const email of ["a@x.com", "b@y.com", "c@z.com"]) {
      expect(isConfiguredAdminEmail(email)).toBe(true);
    }
    expect(isConfiguredAdminEmail("d@w.com")).toBe(false);
  });

  it("grants nobody when the variable is unset or empty", async () => {
    const unset = await loadWithAdminEmails("");
    expect(unset.isConfiguredAdminEmail("owner@example.com")).toBe(false);

    const blank = await loadWithAdminEmails("   ,  ");
    expect(blank.isConfiguredAdminEmail("")).toBe(false);
    expect(blank.isConfiguredAdminEmail("owner@example.com")).toBe(false);
  });
});
