import { notFound } from "next/navigation";
import { AutoPrintTrigger } from "@/components/resume/auto-print-trigger";
import { ResumePrintTemplate } from "@/components/resume/resume-print-template";
import { verifyExportToken } from "@/lib/auth/export-token";
import { getSession } from "@/lib/auth/session";
import type { PrintLang } from "@/lib/constants/print-labels";
import { UnauthorizedError } from "@/lib/errors";
import { getResumeForPrint } from "@/server/services/resume.service";

type PrintPageProps = {
  params: Promise<{ resumeId: string }>;
  searchParams: Promise<{ lang?: string; autoprint?: string; token?: string }>;
};

function resolveLang(lang: string | undefined): PrintLang {
  return lang === "en" ? "en" : "ar";
}

/**
 * Resolves who is allowed to view this print: either the signed-in user via
 * the normal session cookie, or a short-lived export token minted for
 * Puppeteer (which has no browser session) — see PROJECT-BRIEF §6.3.
 */
async function resolveViewer(
  resumeId: string,
  token: string | undefined,
): Promise<{ userId: string; isAdmin: boolean }> {
  if (token) {
    const tokenPayload = await verifyExportToken(token);
    if (tokenPayload && tokenPayload.resumeId === resumeId) {
      return { userId: tokenPayload.userId, isAdmin: false };
    }
  }

  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return { userId: session.sub, isAdmin: session.role === "admin" };
}

export default async function PrintPage({ params, searchParams }: PrintPageProps) {
  const { resumeId } = await params;
  const { lang: rawLang, autoprint, token } = await searchParams;
  const lang = resolveLang(rawLang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const viewer = await resolveViewer(resumeId, token);
  const result = await getResumeForPrint(resumeId, viewer.userId, viewer.isAdmin);
  if (!result.ok) {
    notFound();
  }

  const { resume, sections, itemsBySectionId } = result.value;

  return (
    <div lang={lang} dir={dir}>
      <ResumePrintTemplate
        lang={lang}
        resume={resume}
        sections={sections}
        itemsBySectionId={itemsBySectionId}
      />
      {autoprint === "1" && <AutoPrintTrigger />}
    </div>
  );
}
