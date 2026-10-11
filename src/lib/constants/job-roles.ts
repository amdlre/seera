type JobRoleFamily = {
  id: string;
  /** Arabic and English phrasings that identify this role in a job title. */
  terms: string[];
};

/**
 * Role families used to spot an Arabic/English job-title pair that describe
 * different jobs. A title may hit several families; two titles only conflict
 * when they share none. Terms are matched as whole words after normalization.
 */
export const JOB_ROLE_FAMILIES: JobRoleFamily[] = [
  {
    id: "frontend",
    terms: [
      "frontend",
      "front end",
      "front-end",
      "واجهات امامية",
      "الواجهات الامامية",
      "واجهة امامية",
      "فرونت اند",
    ],
  },
  {
    id: "backend",
    terms: [
      "backend",
      "back end",
      "back-end",
      "واجهات خلفية",
      "الواجهات الخلفية",
      "واجهة خلفية",
      "باك اند",
    ],
  },
  {
    id: "fullstack",
    terms: [
      "full stack",
      "fullstack",
      "full-stack",
      "فل ستاك",
      "التطوير الشامل",
      "مطور شامل",
      "متكامل",
    ],
  },
  {
    id: "mobile",
    terms: [
      "mobile",
      "ios",
      "android",
      "flutter",
      "تطبيقات الجوال",
      "تطبيقات الجوّال",
      "جوال",
      "موبايل",
    ],
  },
  {
    id: "devops",
    terms: ["devops", "sre", "site reliability", "cloud engineer", "ديف اوبس", "الحوسبة السحابية"],
  },
  {
    id: "data",
    terms: [
      "data scientist",
      "data analyst",
      "data engineer",
      "machine learning",
      "علم البيانات",
      "تحليل البيانات",
      "محلل بيانات",
      "عالم بيانات",
      "هندسة البيانات",
    ],
  },
  { id: "design", terms: ["designer", "ui", "ux", "product design", "مصمم", "تصميم"] },
  {
    id: "qa",
    terms: [
      "qa",
      "quality assurance",
      "tester",
      "test engineer",
      "ضمان الجودة",
      "اختبار البرمجيات",
      "مختبر",
    ],
  },
  {
    id: "security",
    terms: ["security", "cybersecurity", "penetration", "الامن السيبراني", "امن المعلومات"],
  },
  {
    id: "projectManagement",
    terms: ["project manager", "مدير مشروع", "مدير مشاريع", "ادارة المشاريع"],
  },
  {
    id: "productManagement",
    terms: ["product manager", "product owner", "مدير منتج", "مالك المنتج"],
  },
  { id: "marketing", terms: ["marketing", "تسويق"] },
  { id: "sales", terms: ["sales", "مبيعات"] },
  { id: "accounting", terms: ["accountant", "accounting", "محاسب", "محاسبة"] },
  {
    id: "hr",
    terms: [
      "human resources",
      "hr",
      "recruiter",
      "talent acquisition",
      "موارد بشرية",
      "الموارد البشرية",
      "توظيف",
    ],
  },
];
