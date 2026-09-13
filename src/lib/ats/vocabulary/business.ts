import { defineTerms } from "./types";

export const BUSINESS_TERMS = defineTerms("business", [
  ["project-management", "Project Management", ["إدارة المشاريع", "إدارة مشاريع"]],
  ["pmp", "PMP", ["project management professional"]],
  ["product-management", "Product Management", ["إدارة المنتجات"]],
  ["stakeholder-management", "Stakeholder Management", ["stakeholders", "إدارة أصحاب المصلحة"]],
  ["strategic-planning", "Strategic Planning", ["strategy", "التخطيط الاستراتيجي"]],
  ["business-analysis", "Business Analysis", ["business analyst", "تحليل الأعمال"]],
  ["requirements-gathering", "Requirements Gathering", ["requirements analysis", "جمع المتطلبات"]],
  ["process-improvement", "Process Improvement", ["process optimization", "تحسين العمليات"]],
  ["operations-management", "Operations Management", ["إدارة العمليات"]],
  ["supply-chain", "Supply Chain Management", ["supply chain", "logistics", "سلاسل الإمداد", "اللوجستيات"]],
  ["risk-management", "Risk Management", ["إدارة المخاطر"]],
  ["quality-assurance", "Quality Assurance", ["qa", "quality control", "ضمان الجودة"]],
  ["customer-service", "Customer Service", ["customer support", "customer experience", "خدمة العملاء"]],
  ["sales", "Sales", ["business development", "المبيعات", "تطوير الأعمال"]],
  ["negotiation", "Negotiation", ["التفاوض"]],
  ["kpis", "KPIs", ["kpi", "key performance indicators", "مؤشرات الأداء"]],
  ["report-writing", "Report Writing", ["report preparation", "إعداد التقارير"]],
  ["budgeting", "Budgeting", ["budget management", "إعداد الميزانيات"]],
]);

export const MARKETING_TERMS = defineTerms("marketing", [
  ["digital-marketing", "Digital Marketing", ["online marketing", "التسويق الرقمي", "التسويق الإلكتروني"]],
  ["seo", "SEO", ["search engine optimization", "تحسين محركات البحث"]],
  ["sem", "SEM", ["google ads", "ppc", "paid search"]],
  ["social-media", "Social Media Marketing", ["social media", "وسائل التواصل الاجتماعي"]],
  ["content-marketing", "Content Marketing", ["content creation", "copywriting", "صناعة المحتوى", "كتابة المحتوى"]],
  ["email-marketing", "Email Marketing", ["التسويق عبر البريد الإلكتروني"]],
  ["brand-management", "Brand Management", ["branding", "إدارة العلامة التجارية"]],
  ["market-research", "Market Research", ["أبحاث السوق", "دراسة السوق"]],
  ["campaign-management", "Campaign Management", ["marketing campaigns", "الحملات التسويقية"]],
]);

export const FINANCE_TERMS = defineTerms("finance", [
  ["accounting", "Accounting", ["المحاسبة"]],
  ["financial-analysis", "Financial Analysis", ["التحليل المالي"]],
  ["financial-reporting", "Financial Reporting", ["التقارير المالية"]],
  ["ifrs", "IFRS", ["المعايير الدولية لإعداد التقارير المالية"]],
  ["auditing", "Auditing", ["audit", "internal audit", "التدقيق", "المراجعة الداخلية"]],
  ["forecasting", "Forecasting", ["financial modeling", "التنبؤ المالي"]],
  ["accounts-payable", "Accounts Payable", ["accounts receivable", "الحسابات الدائنة", "الحسابات المدينة"]],
  ["taxation", "Taxation", ["tax accounting", "zakat", "vat", "الضرائب", "الزكاة", "ضريبة القيمة المضافة"]],
  ["cpa", "CPA", ["socpa", "cma", "acca"]],
  ["payroll", "Payroll", ["الرواتب", "مسيرات الرواتب"]],
]);

export const HR_TERMS = defineTerms("hr", [
  ["recruitment", "Recruitment", ["talent acquisition", "التوظيف", "استقطاب المواهب"]],
  ["onboarding", "Onboarding", ["تهيئة الموظفين الجدد"]],
  ["training-development", "Training & Development", ["employee training", "learning and development", "التدريب والتطوير"]],
  ["performance-management", "Performance Management", ["performance appraisal", "تقييم الأداء"]],
  ["employee-relations", "Employee Relations", ["علاقات الموظفين"]],
  ["hris", "HRIS", ["hr systems", "أنظمة الموارد البشرية"]],
  ["labor-law", "Labor Law", ["نظام العمل", "قانون العمل"]],
  ["compensation-benefits", "Compensation & Benefits", ["compensation and benefits", "التعويضات والمزايا"]],
]);
