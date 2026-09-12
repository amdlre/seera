import puppeteer from "puppeteer";
import { signExportToken } from "@/lib/auth/export-token";
import { env } from "@/lib/env";
import type { PrintLang } from "@/lib/constants/print-labels";

/**
 * Renders `/print/[resumeId]` with a real headless Chromium and returns the
 * resulting PDF bytes. Chromium is what correctly shapes Arabic script and
 * produces selectable, extractable text — the non-negotiable ATS requirement
 * from ATS-CRITERIA.md §2.
 */
export async function generateResumePdf(resumeId: string, userId: string, lang: PrintLang): Promise<Buffer> {
  const token = await signExportToken({ resumeId, userId });
  const printUrl = `${env.NEXT_PUBLIC_APP_URL}/print/${resumeId}?lang=${lang}&token=${token}`;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(printUrl, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");

    const pdfBytes = await page.pdf({
      format: "A4",
      printBackground: false,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBytes);
  } finally {
    await browser.close();
  }
}
