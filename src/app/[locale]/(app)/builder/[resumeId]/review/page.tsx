import { setRequestLocale } from "next-intl/server";
import { ReviewExportSection } from "@/components/builder/review-export-section";

type ReviewPageProps = {
  params: Promise<{ locale: string; resumeId: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { locale, resumeId } = await params;
  setRequestLocale(locale);

  return <ReviewExportSection resumeId={resumeId} />;
}
