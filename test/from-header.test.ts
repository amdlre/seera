import { describe, expect, it } from "vitest";
import { encodeFromHeader } from "@/lib/mail/from-header";

describe("encodeFromHeader", () => {
  it("encodes an Arabic display name as an RFC 2047 word", () => {
    const header = encodeFromHeader("سِيرة <no-reply@mail.basilmyq.com>");
    expect(header).toBe(
      `=?UTF-8?B?${Buffer.from("سِيرة", "utf8").toString("base64")}?= <no-reply@mail.basilmyq.com>`,
    );
    expect(/^[\x20-\x7E]+$/.test(header)).toBe(true);
  });

  it("quotes an ASCII display name instead of encoding it", () => {
    expect(encodeFromHeader("Seera <a@b.com>")).toBe('"Seera" <a@b.com>');
    expect(encodeFromHeader('"Seera" <a@b.com>')).toBe('"Seera" <a@b.com>');
  });

  it("passes through a bare address, with or without brackets", () => {
    expect(encodeFromHeader("a@b.com")).toBe("a@b.com");
    expect(encodeFromHeader("  <a@b.com> ")).toBe("a@b.com");
  });

  it("escapes quotes so a name cannot break the header", () => {
    expect(encodeFromHeader('Se"era <a@b.com>')).toBe('"Se\\"era" <a@b.com>');
  });
});
