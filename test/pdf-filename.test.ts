import { describe, expect, it } from "vitest";
import {
  attachmentDisposition,
  buildExportFilename,
  filenameFromDisposition,
} from "@/lib/pdf/filename";

describe("attachmentDisposition", () => {
  it("round-trips an Arabic filename through filename*", () => {
    const filename = buildExportFilename("باسل محمد", "مطوّر واجهات");
    expect(filenameFromDisposition(attachmentDisposition(filename))).toBe(filename);
  });

  it("keeps the header itself pure ASCII", () => {
    const header = attachmentDisposition(buildExportFilename("باسل محمد", ""));
    expect(/^[\x20-\x7E]+$/.test(header)).toBe(true);
  });

  it("uses the real name as the fallback when it is already ASCII", () => {
    const header = attachmentDisposition("Basil_Mohammed_Frontend_Developer.pdf");
    expect(header).toContain('filename="Basil_Mohammed_Frontend_Developer.pdf"');
  });

  it("falls back to a generic name when nothing ASCII survives", () => {
    expect(attachmentDisposition("باسل_محمد.pdf")).toContain('filename="Resume.pdf"');
  });

  it("drops the separator left behind by a stripped Arabic segment", () => {
    expect(attachmentDisposition("Basil_مطور.pdf")).toContain('filename="Basil.pdf"');
  });

  it("cannot be broken by quotes or header injection in a name", () => {
    const header = attachmentDisposition('Evil"\r\nSet-Cookie: x=1.pdf');
    expect(header).not.toMatch(/[\r\n]/);
    expect(header.match(/"/g)).toHaveLength(2);
  });
});

describe("filenameFromDisposition", () => {
  it("returns null when the header is missing or has no filename*", () => {
    expect(filenameFromDisposition(null)).toBeNull();
    expect(filenameFromDisposition('attachment; filename="a.pdf"')).toBeNull();
  });

  it("returns null instead of throwing on malformed encoding", () => {
    expect(filenameFromDisposition("attachment; filename*=UTF-8''%E0%A4%A")).toBeNull();
  });
});
