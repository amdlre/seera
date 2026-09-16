import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { logger } from "@/lib/logger";
import { DEFAULT_RESUME_SECTIONS } from "@/lib/constants/resume-sections";
import * as schema from "./schema";

config({ path: ".env.local", quiet: true });

/**
 * Seeds local/dev data: one admin, one regular user, and one draft resume
 * with all standard sections and a couple of items, so the builder and
 * dashboard have something to render against.
 */
const LOCAL_DATABASE_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "postgres"]);

/**
 * Refuses to write demo accounts (including a known admin email) anywhere but
 * a local database. An explicit `ALLOW_SEED=true` is the only override.
 */
function assertSafeSeedTarget(databaseUrl: string): void {
  if (process.env.ALLOW_SEED === "true") return;

  const host = new URL(databaseUrl).hostname;
  if (process.env.NODE_ENV === "production" || !LOCAL_DATABASE_HOSTS.has(host)) {
    throw new Error(
      `Refusing to seed "${host}": demo data is for local databases only. ` +
        "Set ALLOW_SEED=true if you really mean it.",
    );
  }
}

async function seed(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run the seed script.");
  }
  assertSafeSeedTarget(process.env.DATABASE_URL);

  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient, { schema });

  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@seera.dev",
      fullName: "مدير سِيرة",
      role: "admin",
      locale: "ar",
    })
    .returning();

  const [user] = await db
    .insert(schema.users)
    .values({
      email: "basil@seera.dev",
      fullName: "باسل محمد",
      role: "user",
      locale: "ar",
    })
    .returning();

  const [resume] = await db
    .insert(schema.resumes)
    .values({
      userId: user.id,
      title: "سِيرة - باسل محمد",
      targetJobTitleAr: "مطوّر واجهات أمامية (Frontend Developer)",
      targetJobTitleEn: "Frontend Developer",
      status: "draft",
      atsScore: 0,
      font: "arial",
    })
    .returning();

  const insertedSections = await db
    .insert(schema.resumeSections)
    .values(
      DEFAULT_RESUME_SECTIONS.map((section) => ({
        ...section,
        resumeId: resume.id,
      })),
    )
    .returning();

  const personalSection = insertedSections.find((section) => section.type === "personal");
  if (personalSection) {
    await db.insert(schema.resumeItems).values({
      sectionId: personalSection.id,
      sortOrder: 0,
      data: {
        fullNameAr: "باسل محمد",
        fullNameEn: "Basil Mohammed",
        targetJobTitleAr: "مطوّر واجهات أمامية (Frontend Developer)",
        targetJobTitleEn: "Frontend Developer",
        email: "basil@seera.dev",
        phone: "+966 50 000 0000",
        cityCountryAr: "الرياض، السعودية",
        cityCountryEn: "Riyadh, Saudi Arabia",
        linkedin: "linkedin.com/in/basil",
        portfolioUrl: "github.com/basil",
      },
    });
  }

  const summarySection = insertedSections.find((section) => section.type === "summary");
  if (summarySection) {
    await db.insert(schema.resumeItems).values({
      sectionId: summarySection.id,
      sortOrder: 0,
      data: {
        summaryAr:
          "مطوّر واجهات أمامية بخبرة 4 سنوات في بناء تطبيقات ويب باستخدام React وNext.js وTypeScript. قدت إعادة بناء منصة تجارة إلكترونية خدمت أكثر من 50,000 مستخدم شهريًا وخفّضت زمن التحميل بنسبة 40%.",
        summaryEn:
          "Frontend Developer with 4 years of experience building web applications using React, Next.js, and TypeScript. Led the rebuild of an e-commerce platform serving 50,000+ monthly users, reducing load time by 40%.",
      },
    });
  }

  const experienceSection = insertedSections.find((section) => section.type === "experience");
  if (experienceSection) {
    await db.insert(schema.resumeItems).values({
      sectionId: experienceSection.id,
      sortOrder: 0,
      data: {
        titleAr: "مطوّر واجهات أمامية",
        titleEn: "Frontend Developer",
        company: "شركة تقنية",
        cityCountry: "الرياض، السعودية",
        startMonth: 3,
        startYear: 2021,
        endMonth: 8,
        endYear: 2024,
        isCurrent: false,
        bulletsAr: [
          "طوّرت 12 واجهة تفاعلية باستخدام React وTypeScript، ما رفع معدل إتمام الطلبات بنسبة 18%",
        ],
        bulletsEn: [
          "Developed 12 interactive interfaces using React and TypeScript, raising order completion by 18%",
        ],
      },
    });
  }

  const educationSection = insertedSections.find((section) => section.type === "education");
  if (educationSection) {
    await db.insert(schema.resumeItems).values({
      sectionId: educationSection.id,
      sortOrder: 0,
      data: {
        degreeAr: "بكالوريوس علوم الحاسب",
        degreeEn: "B.Sc. in Computer Science",
        majorAr: "علوم الحاسب",
        majorEn: "Computer Science",
        universityAr: "جامعة الملك سعود",
        universityEn: "King Saud University",
        cityCountry: "الرياض، السعودية",
        graduationYear: 2020,
        isExpected: false,
        gpaValue: 4.35,
        gpaScale: 5,
      },
    });
  }

  const skillsSection = insertedSections.find((section) => section.type === "skills");
  if (skillsSection) {
    await db.insert(schema.resumeItems).values([
      {
        sectionId: skillsSection.id,
        sortOrder: 0,
        data: {
          categoryAr: "لغات البرمجة",
          categoryEn: "Programming Languages",
          skillsAr: "JavaScript, TypeScript, Python",
          skillsEn: "JavaScript, TypeScript, Python",
        },
      },
      {
        sectionId: skillsSection.id,
        sortOrder: 1,
        data: {
          categoryAr: "الأطر والمكتبات",
          categoryEn: "Frameworks & Libraries",
          skillsAr: "React, Next.js, Node.js, Tailwind CSS",
          skillsEn: "React, Next.js, Node.js, Tailwind CSS",
        },
      },
    ]);
  }

  const certificationsSection = insertedSections.find(
    (section) => section.type === "certifications",
  );
  if (certificationsSection) {
    await db.insert(schema.resumeItems).values({
      sectionId: certificationsSection.id,
      sortOrder: 0,
      data: {
        nameAr: "AWS Certified Solutions Architect – Associate",
        nameEn: "AWS Certified Solutions Architect – Associate",
        issuerAr: "Amazon Web Services",
        issuerEn: "Amazon Web Services",
        issueMonth: 6,
        issueYear: 2023,
        neverExpires: false,
        expiryMonth: 6,
        expiryYear: 2026,
        credentialId: "ABC123XYZ",
        verificationUrl: "",
      },
    });
  }

  const languagesSection = insertedSections.find((section) => section.type === "languages");
  if (languagesSection) {
    await db.insert(schema.resumeItems).values([
      {
        sectionId: languagesSection.id,
        sortOrder: 0,
        data: { languageAr: "العربية", languageEn: "Arabic", level: "native", detail: "" },
      },
      {
        sectionId: languagesSection.id,
        sortOrder: 1,
        data: {
          languageAr: "الإنجليزية",
          languageEn: "English",
          level: "advanced",
          detail: "IELTS 7.0",
        },
      },
    ]);
  }

  await db.insert(schema.auditLog).values({
    adminUserId: admin.id,
    action: "seed.initial_data",
    targetType: "resume",
    targetId: resume.id,
    metadata: { note: "بيانات تجريبية للتطوير المحلي" },
  });

  logger.info("Seed complete", { users: 2, resumes: 1, sections: insertedSections.length });
  await queryClient.end();
}

seed().catch((error: unknown) => {
  logger.error("Seed failed", { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});
