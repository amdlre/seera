import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import puppeteer, { type Browser } from "puppeteer";
import { signExportToken } from "@/lib/auth/export-token";
import {
  PDF_CHROMIUM_ARGS,
  PDF_PROFILE_DIR_PREFIX,
  PDF_RENDER_LOOPBACK_HOST,
  PDF_RENDER_TIMEOUT_MS,
} from "@/lib/constants/pdf";
import type { PrintLang } from "@/lib/constants/print-labels";
import { env } from "@/lib/env";
import { PdfRenderError } from "@/lib/errors";

/**
 * Origin Puppeteer loads `/print` from. Resolved at runtime from the port the
 * server actually listens on — `NEXT_PUBLIC_APP_URL` is inlined at build time
 * and is the public domain anyway, so it can point at the wrong place.
 */
function resolveRenderOrigin(): string {
  return env.PDF_RENDER_ORIGIN ?? `http://${PDF_RENDER_LOOPBACK_HOST}:${env.PORT}`;
}

/**
 * Starts headless Chromium with a fresh, writable profile directory and
 * HOME/XDG pointing into it — a container user without a real home makes
 * Chromium's crash handler abort at launch otherwise.
 */
async function launchBrowser(profileDir: string): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: PDF_CHROMIUM_ARGS,
    userDataDir: profileDir,
    env: {
      ...process.env,
      HOME: profileDir,
      XDG_CONFIG_HOME: profileDir,
      XDG_CACHE_HOME: profileDir,
    },
  });
}

/**
 * Renders `/print/[resumeId]` with a real headless Chromium and returns the
 * resulting PDF bytes. Chromium is what correctly shapes Arabic script and
 * produces selectable, extractable text — the non-negotiable ATS requirement
 * from ATS-CRITERIA.md §2. Throws `PdfRenderError` if the page can't load.
 */
export async function generateResumePdf(
  resumeId: string,
  userId: string,
  lang: PrintLang,
): Promise<Buffer> {
  const token = await signExportToken({ resumeId, userId });
  const printUrl = `${resolveRenderOrigin()}/print/${resumeId}?lang=${lang}&token=${token}`;

  const profileDir = await mkdtemp(path.join(tmpdir(), PDF_PROFILE_DIR_PREFIX));
  let browser: Browser;
  try {
    browser = await launchBrowser(profileDir);
  } catch (error) {
    await rm(profileDir, { recursive: true, force: true });
    throw error;
  }

  try {
    const page = await browser.newPage();
    const response = await page.goto(printUrl, {
      waitUntil: "networkidle0",
      timeout: PDF_RENDER_TIMEOUT_MS,
    });
    if (!response?.ok()) {
      throw new PdfRenderError(`Print page responded with HTTP ${response?.status() ?? "none"}`);
    }
    await page.evaluateHandle("document.fonts.ready");

    const pdfBytes = await page.pdf({
      format: "A4",
      printBackground: false,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBytes);
  } finally {
    await browser.close();
    await rm(profileDir, { recursive: true, force: true });
  }
}
