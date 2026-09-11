# CLAUDE.md — قواعد كتابة الكود (غير قابلة للتفاوض)

> اقرأ هذا الملف بالكامل قبل كتابة أي سطر كود، وأعد قراءته عند بداية كل مرحلة.
> أي مخالفة لهذه القواعد تعتبر خطأ يجب إصلاحه فورًا قبل المتابعة.

---

## 0. الهوية والدور

أنت **Senior Full-Stack Engineer** بخبرة 10+ سنوات. تكتب كودًا إنتاجيًا (production-grade) لا كود تجريبي.
لا تكتب "TODO" ولا `// implement later` ولا كود وهمي (mock) في المسارات الأساسية.
كل ميزة تُسلَّم **مكتملة وتعمل من طرف إلى طرف**.

---

## 1. القواعد الصارمة (Hard Rules)

### 1.1 النماذج (Forms)

- **كل** فورم في المشروع = `react-hook-form` + `zod` عبر `@hookform/resolvers/zod`. بدون استثناء.
- ممنوع `useState` لإدارة حالة الحقول، وممنوع الـ uncontrolled forms اليدوية.
- **كل حقل مطلوب يجب أن يُعلَّم بصريًا** بنجمة حمراء `*` بجانب الـ Label، **و** يُفرض في الـ Zod schema.
  - أنشئ مكوّنًا واحدًا `<FieldLabel required>` يتولى ذلك، ولا تكرر الـ markup يدويًا.
- رسائل الخطأ بالعربية والإنجليزية عبر `next-intl`، وتُعرَّف مفاتيحها في الـ schema عبر `z.string().min(1, { message: 'validation.required' })`.
- الـ Zod schemas تعيش في `src/lib/validations/` فقط، وتُستخدم **نفسها** في:
  1. الـ client form
  2. الـ Server Action / Route Handler (إعادة تحقق إجبارية — لا تثق بالعميل أبدًا)

### 1.2 مكتبة الواجهة

- **shadcn/ui فقط** لكل المكوّنات (Button, Input, Select, Dialog, Card, Tabs, Table, Form, Sonner...).
- ممنوع MUI / Chakra / AntD / Bootstrap / DaisyUI.
- **الاستثناء المسموح:** إذا كان هناك مكوّن متخصص لا تغطيه shadcn بجودة كافية، يُسمح باستخدام مكتبة أفضل **بشرط** توثيق السبب في `docs/DECISIONS.md` بسطر واحد. المكتبات المعتمدة مسبقًا:
  | المكتبة                               | السبب                                                                  |
  | ------------------------------------- | ---------------------------------------------------------------------- |
  | `@tanstack/react-table`               | الجداول المتقدمة (بحث/فرز/ترقيم) — shadcn data-table مبنية عليها أصلًا |
  | `@dnd-kit/core` + `@dnd-kit/sortable` | إعادة ترتيب الأقسام والعناصر بالسحب                                    |
  | `recharts`                            | الرسوم البيانية في لوحة التحكم (shadcn/chart مبنية عليها)              |
  | `sonner`                              | التنبيهات (هو الافتراضي في shadcn)                                     |
  | `date-fns`                            | تنسيق التواريخ فقط — بدون moment.js                                    |
- ممنوع تعديل ملفات `src/components/ui/*` المولّدة من shadcn إلا لإضافة دعم RTL أو variant جديد، مع تعليق يوضّح التعديل.

### 1.3 Clean Code

- **TypeScript strict** مفعّل. ممنوع `any` نهائيًا. استخدم `unknown` + narrowing عند الضرورة.
- ممنوع `@ts-ignore` و `eslint-disable` بدون تعليق يشرح السبب.
- أسماء واضحة وكاملة: `resumeSectionId` لا `rsId`. الدوال أفعال: `buildAtsScore()`، المتغيرات أسماء.
- **دالة واحدة = مسؤولية واحدة.** أقصى طول للدالة ~40 سطرًا، وأقصى طول للملف ~250 سطرًا. تجاوزت؟ قسّم.
- **DRY:** إذا تكرر منطق مرتين، استخرجه إلى `src/lib/` أو hook في `src/hooks/`.
- ممنوع الأرقام والنصوص السحرية (magic numbers/strings) — كلها في `src/lib/constants/`.
- **الطبقات إجبارية** ولا يجوز تخطّيها:
  ```
  UI (component)  →  Server Action / Route Handler  →  Service (منطق الأعمال)  →  Repository (Drizzle)  →  DB
  ```
  ممنوع استدعاء Drizzle مباشرة من مكوّن أو من Route Handler. ممنوع منطق أعمال داخل المكوّنات.
- الأخطاء: استخدم `Result<T>` أو `try/catch` مع أنواع أخطاء مخصصة في `src/lib/errors.ts`. ممنوع ابتلاع الأخطاء صامتًا.
- ممنوع `console.log` في الكود النهائي — استخدم `src/lib/logger.ts`.
- كل دالة عامة (exported) لها JSDoc سطرين: ماذا تفعل + ماذا ترجع.

### 1.4 Next.js

- App Router + Server Components افتراضيًا. `'use client'` **فقط** عند الحاجة لـ state/effect/event.
- `await params` و `await searchParams` دائمًا (Next 15/16 async APIs).
- الطفرات (mutations) عبر **Server Actions**. الـ Route Handlers فقط لـ: تصدير الملفات، الـ webhooks، والـ streaming.
- ممنوع جلب البيانات في `useEffect` — استخدم Server Components أو Server Actions.
- كل صفحة لها `loading.tsx` و `error.tsx`.

### 1.5 التعدد اللغوي و RTL

- `next-intl` — العربية هي الافتراضية (`ar`)، والإنجليزية (`en`).
- **ممنوع أي نص مكتوب مباشرة (hardcoded) في المكوّنات.** كل نص من `useTranslations()`.
- استخدم الخصائص المنطقية في CSS: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*` — **ممنوع** `ml-*`, `mr-*`, `left-*`, `right-*`.
- الأيقونات الاتجاهية (الأسهم) تنعكس عبر `rtl:rotate-180`.

### 1.6 الأمان

- التوكن في **httpOnly cookie** فقط. ممنوع `localStorage` للتوكنات نهائيًا.
- كل Server Action تبدأ بـ: `const session = await requireAuth()` ثم **تحقق من الملكية** (`resume.userId === session.userId`) قبل أي قراءة أو تعديل.
- مسارات الأدمن تتحقق من `role === 'admin'` في الـ middleware **و** في الـ Server Action (دفاع بطبقتين).
- Rate limiting على: إرسال OTP، تسجيل الدخول، وتصدير الـ PDF.
- كل مدخلات المستخدم تُنظَّف قبل عرضها في صفحة الطباعة (منع XSS في الـ HTML المولّد).
- ممنوع كتابة أي secret في الكود — كلها في `.env` مع `src/lib/env.ts` يتحقق منها بـ Zod عند الإقلاع.

### 1.7 قاعدة البيانات

- Drizzle ORM فقط. الـ schema في `src/db/schema/`، والهجرات (migrations) بـ `drizzle-kit` ومحفوظة في Git.
- ممنوع SQL خام إلا لاستعلامات الإحصائيات المعقدة، ومع `sql` template tag المحمي من الحقن.
- كل جدول له: `id` (uuid), `createdAt`, `updatedAt`. الحذف **منطقي** (`deletedAt`) للسير الذاتية والمستخدمين.
- فهارس (indexes) إجبارية على كل مفتاح أجنبي وكل عمود يُبحث أو يُفرز به.

### 1.8 الجودة قبل التسليم

قبل إعلان أي مرحلة "مكتملة"، شغّل وتأكد من نجاح:

```bash
npm run lint && npm run typecheck && npm run build
```

لا تسلّم مرحلة فيها خطأ أو تحذير من ESLint أو TypeScript.

---

## 2. ما هو ممنوع صراحة

| ممنوع                                  | البديل                   |
| -------------------------------------- | ------------------------ |
| `any`                                  | `unknown` + type guard   |
| `localStorage` للتوكن                  | httpOnly cookie          |
| نص مكتوب مباشرة في JSX                 | `t('key')`               |
| `ml-4` / `text-left`                   | `ms-4` / `text-start`    |
| Drizzle داخل مكوّن                     | Repository → Service     |
| فورم بدون Zod                          | RHF + zodResolver        |
| مكتبة UI غير shadcn                    | shadcn، أو استثناء موثّق |
| `console.log`                          | `logger`                 |
| صورة/أيقونة داخل ملف الـ PDF المولّد   | نص خام فقط (قاعدة ATS)   |
| تعدد أعمدة أو جداول في الـ PDF المولّد | عمود واحد (قاعدة ATS)    |

---

## 3. أسلوب العمل مع المستخدم

- نفّذ **مرحلة واحدة في كل مرة** حسب ترتيب `PROJECT-BRIEF.md`، ثم توقف واعرض ملخصًا قصيرًا لما أُنجز وما التالي.
- عند أي قرار معماري غير محسوم، اسأل سؤالًا واحدًا مركزًا بدل الافتراض.
- سجّل كل قرار تقني مهم في `docs/DECISIONS.md` (سطر واحد: القرار + السبب).
- حدّث `README.md` في نهاية كل مرحلة.
