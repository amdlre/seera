import { FileText } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { CreateResumeButton } from "@/components/builder/create-resume-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/session";
import { listMyResumes } from "@/server/services/resume.service";

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAuth();
  const t = await getTranslations("dashboard");
  const resumes = await listMyResumes(session.sub);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">
            {t("welcome", { name: session.email })}
          </h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-medium">{t("myResumes")}</h2>
        <CreateResumeButton />
      </div>

      {resumes.length === 0 ? (
        <EmptyState icon={FileText} title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="flex flex-col gap-3">
          {resumes.map((resume) => (
            <Link key={resume.id} href={`/builder/${resume.id}/personal`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-foreground font-medium">{resume.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {t(`status.${resume.status}`)} · {t("atsScore", { score: resume.atsScore })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
