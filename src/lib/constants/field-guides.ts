import type { AppLocale } from "@/i18n/routing";

export type FieldGuide = {
  tip: Record<AppLocale, string>;
  example: Record<AppLocale, string>;
};

/**
 * Per-field writing rules and ready-to-use examples, translated from
 * ATS-CRITERIA.md §3. Drives the tooltip, permanent tip line, and
 * collapsible example in <FieldWithExample>.
 */
export const FIELD_GUIDES = {
  fullNameAr: {
    tip: {
      ar: "اسمك كما في الهوية، بدون ألقاب",
      en: "Your name as on your ID, no titles",
    },
    example: { ar: "محمد عبدالله القحطاني", en: "محمد عبدالله القحطاني" },
  },
  fullNameEn: {
    tip: {
      ar: "اكتب اسمك بالحروف اللاتينية كما تريده أن يظهر في السيرة الإنجليزية",
      en: "Your name in Latin letters, as you want it to appear on the English resume",
    },
    example: { ar: "Mohammed Abdullah Alqahtani", en: "Mohammed Abdullah Alqahtani" },
  },
  targetJobTitleAr: {
    tip: {
      ar: "انسخه حرفيًا من الإعلان الوظيفي",
      en: "Copy it exactly from the job posting",
    },
    example: {
      ar: "مطوّر واجهات أمامية (Frontend Developer)",
      en: "مطوّر واجهات أمامية (Frontend Developer)",
    },
  },
  targetJobTitleEn: {
    tip: {
      ar: "انسخه حرفيًا من الإعلان الوظيفي بالإنجليزية",
      en: "Copy it exactly from the job posting",
    },
    example: { ar: "Frontend Developer", en: "Frontend Developer" },
  },
  email: {
    tip: {
      ar: "بريد مهني باسمك، تجنّب البريد الطفولي",
      en: "A professional email with your name",
    },
    example: { ar: "mohammed.alqahtani@gmail.com", en: "mohammed.alqahtani@gmail.com" },
  },
  phone: {
    tip: {
      ar: "بصيغة دولية بدون أقواس أو شرطات",
      en: "International format, no parentheses or dashes",
    },
    example: { ar: "+966 50 000 0000", en: "+966 50 000 0000" },
  },
  cityCountryAr: {
    tip: {
      ar: "المدينة والدولة فقط، بدون عنوان تفصيلي",
      en: "City and country only, no detailed address",
    },
    example: { ar: "الرياض، السعودية", en: "الرياض، السعودية" },
  },
  cityCountryEn: {
    tip: {
      ar: "المدينة والدولة بالإنجليزية",
      en: "City and country only, no detailed address",
    },
    example: { ar: "Riyadh, Saudi Arabia", en: "Riyadh, Saudi Arabia" },
  },
  linkedin: {
    tip: { ar: "رابط كامل بدون اختصار", en: "Full link, not a shortened one" },
    example: { ar: "linkedin.com/in/username", en: "linkedin.com/in/username" },
  },
  portfolioUrl: {
    tip: { ar: "GitHub أو موقعك الشخصي", en: "GitHub or your personal portfolio" },
    example: { ar: "github.com/username", en: "github.com/username" },
  },
  summaryAr: {
    tip: {
      ar: "3-4 أسطر: المسمى وسنوات الخبرة، أبرز مجالين، إنجاز برقم، وما تبحث عنه",
      en: "3-4 lines: title + years, top two skills, a measurable win, what you're seeking",
    },
    example: {
      ar: "مطوّر واجهات أمامية بخبرة 4 سنوات في بناء تطبيقات ويب باستخدام React وNext.js وTypeScript. قدت إعادة بناء منصة تجارة إلكترونية خدمت أكثر من 50,000 مستخدم شهريًا وخفّضت زمن التحميل بنسبة 40%. أبحث عن دور يركّز على الأداء وتجربة المستخدم في منتج واسع الانتشار.",
      en: "مطوّر واجهات أمامية بخبرة 4 سنوات في بناء تطبيقات ويب باستخدام React وNext.js وTypeScript. قدت إعادة بناء منصة تجارة إلكترونية خدمت أكثر من 50,000 مستخدم شهريًا وخفّضت زمن التحميل بنسبة 40%. أبحث عن دور يركّز على الأداء وتجربة المستخدم في منتج واسع الانتشار.",
    },
  },
  summaryEn: {
    tip: {
      ar: "نفس الفكرة بالإنجليزية: المسمى، الخبرة، إنجاز برقم، الهدف",
      en: "3-4 lines: title + years, top two skills, a measurable win, what you're seeking",
    },
    example: {
      ar: "Frontend Developer with 4 years of experience building web applications using React, Next.js, and TypeScript. Led the rebuild of an e-commerce platform serving 50,000+ monthly users, reducing load time by 40%. Seeking a role focused on performance and user experience at scale.",
      en: "Frontend Developer with 4 years of experience building web applications using React, Next.js, and TypeScript. Led the rebuild of an e-commerce platform serving 50,000+ monthly users, reducing load time by 40%. Seeking a role focused on performance and user experience at scale.",
    },
  },
  experienceTitle: {
    tip: {
      ar: "انسخه حرفيًا من عقدك أو الإعلان الوظيفي",
      en: "Copy it exactly from your contract or the job posting",
    },
    example: { ar: "مطوّر واجهات أمامية", en: "Frontend Developer" },
  },
  experienceCompany: {
    tip: { ar: "اسم الشركة كما هو رسميًا", en: "The company's official name" },
    example: { ar: "شركة تقنية", en: "Tech Company" },
  },
  experienceCityCountry: {
    tip: { ar: "المدينة والدولة فقط", en: "City and country only" },
    example: { ar: "الرياض، السعودية", en: "Riyadh, Saudi Arabia" },
  },
  experienceBullet: {
    tip: {
      ar: "فعل قوي في الماضي + ماذا فعلت + الأداة + النتيجة برقم",
      en: "Strong past-tense verb + what you did + the tool + a measurable result",
    },
    example: {
      ar: "طوّرت 12 واجهة تفاعلية باستخدام React وTypeScript، ما رفع معدل إتمام الطلبات بنسبة 18%",
      en: "Reduced page load time from 4.2s to 1.8s by implementing code splitting and image optimization",
    },
  },
  educationDegree: {
    tip: { ar: "الدرجة العلمية كاملة", en: "The full degree title" },
    example: { ar: "بكالوريوس علوم الحاسب", en: "B.Sc. in Computer Science" },
  },
  educationMajor: {
    tip: { ar: "التخصص الدقيق", en: "Your specific major" },
    example: { ar: "علوم الحاسب", en: "Computer Science" },
  },
  educationUniversity: {
    tip: { ar: "اسم الجامعة كاملًا", en: "The university's full name" },
    example: { ar: "جامعة الملك سعود", en: "King Saud University" },
  },
  skillCategory: {
    tip: {
      ar: "اسم فئة قصير: لغات البرمجة، الأطر والمكتبات، الأدوات...",
      en: "A short category name: Programming Languages, Frameworks, Tools...",
    },
    example: { ar: "لغات البرمجة", en: "Programming Languages" },
  },
  skillList: {
    tip: {
      ar: "انسخ المهارات بالصيغة نفسها الواردة في الإعلان الوظيفي، مفصولة بفواصل",
      en: "Copy skills in the exact spelling from the job posting, comma-separated",
    },
    example: { ar: "JavaScript, TypeScript, Python", en: "JavaScript, TypeScript, Python" },
  },
  certificationName: {
    tip: {
      ar: "الاسم الرسمي الكامل للشهادة كما هو في الشهادة نفسها",
      en: "The certificate's full official name, exactly as printed",
    },
    example: {
      ar: "AWS Certified Solutions Architect – Associate",
      en: "AWS Certified Solutions Architect – Associate",
    },
  },
  certificationIssuer: {
    tip: { ar: "الجهة المانحة للشهادة", en: "The issuing organization" },
    example: { ar: "Amazon Web Services", en: "Amazon Web Services" },
  },
  languageName: {
    tip: { ar: "اسم اللغة", en: "The language name" },
    example: { ar: "الإنجليزية", en: "English" },
  },
} as const satisfies Record<string, FieldGuide>;

export type FieldGuideKey = keyof typeof FIELD_GUIDES;
