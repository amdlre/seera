/**
 * Mail headers are ASCII-only, so a non-ASCII display name ("سِيرة") must be
 * encoded per RFC 2047 or the provider drops it and shows the bare address.
 */
const FROM_PATTERN = /^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/;

function isAscii(value: string): boolean {
  return /^[\x20-\x7E]*$/.test(value);
}

/** Wraps a display name as an RFC 2047 base64 "encoded word". */
function encodeWord(name: string): string {
  return `=?UTF-8?B?${Buffer.from(name, "utf8").toString("base64")}?=`;
}

/**
 * Normalises a `MAIL_FROM` value into a header-safe `From`. Returns the address
 * unchanged when it carries no display name.
 */
export function encodeFromHeader(mailFrom: string): string {
  const match = FROM_PATTERN.exec(mailFrom);
  if (!match) return mailFrom.trim();

  const [, rawName, address] = match;
  const name = rawName.replace(/^"(.*)"$/, "$1").trim();
  if (!name) return address.trim();

  return `${isAscii(name) ? `"${name.replace(/(["\\])/g, "\\$1")}"` : encodeWord(name)} <${address.trim()}>`;
}
