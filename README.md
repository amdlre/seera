# سِيرة (Seera)

منصّة عربية/إنجليزية لبناء سيرة ذاتية تجتاز أنظمة تتبّع المتقدمين (ATS)، بخطوات مشروحة بأمثلة جاهزة لكل حقل.

راجع `PROJECT-BRIEF.md` للرؤية والخطة الكاملة، `CLAUDE.md` لقواعد الكود، و`ATS-CRITERIA.md` لمعايير المحتوى والتنسيق.

## الحزمة التقنية (المرحلة 0)

- Next.js 16 (App Router + Turbopack + React 19)
- TypeScript strict
- Tailwind CSS v4 + shadcn/ui (preset: Radix/Nova)
- next-intl (`ar` افتراضي، `en`) مع دعم RTL/LTR كامل
- react-hook-form + zod
- @dnd-kit (سحب وإفلات لإعادة ترتيب العناصر والأقسام)
- Drizzle ORM + PostgreSQL 16
- المصادقة: بريد + رمز OTP لمرة واحدة + JWT (`jose`) في httpOnly cookie
- Puppeteer (Chromium) لتوليد PDF على السيرفر + S3 (`@aws-sdk`) للتخزين
- Vitest للاختبارات الآلية
- ESLint (صارم) + Prettier

## التشغيل محليًا

```bash
cp .env.example .env.local   # عدّل القيم إن لزم (JWT_SECRET عشوائي 32+ حرفًا في الإنتاج)
docker compose up -d          # PostgreSQL (5433) + Mailhog (بريد OTP) + MinIO (تخزين PDF محليًا)
npm install
npm run db:migrate            # تطبيق الهجرات
npm run db:seed               # بيانات تجريبية (مستخدمان + سيرة كاملة)
npm run dev
```

يفتح على `http://localhost:3000/ar` (أو `/en`). **مهم**: شغّل `npm run dev` على المنفذ 3000 تحديدًا (المطابق لـ `NEXT_PUBLIC_APP_URL` في `.env.local`) — Puppeteer يستخدم هذا المتغيّر للوصول إلى صفحة `/print` عند توليد PDF.

> ملاحظة: المنفذ المحلي لـ PostgreSQL هو **5433** لا 5432 (راجع `docs/DECISIONS.md`).

### تسجيل الدخول محليًا (OTP)

سجّل الدخول بأي بريد (مثل `basil@seera.dev` من `seed.ts`)، ثم افتح **http://localhost:8025** (واجهة Mailhog) لقراءة رمز الدخول المرسل — لا حاجة لحساب بريد حقيقي في التطوير.

### تصدير PDF محليًا (MinIO)

ملفات PDF المولَّدة تُرفع إلى MinIO (يحاكي S3). لتصفّحها: افتح **http://localhost:9001** وسجّل الدخول بـ `seera` / `seera12345`.

## أوامر الجودة

```bash
npm run lint
npm run typecheck
npm run build
npm run format
npm run test    # Vitest — راجع "الاختبارات الآلية" أدناه
```

## الاختبارات الآلية

`test/pdf-export.test.ts` يتحقق من معايير القبول في `ATS-CRITERIA.md` §5 (عدد الصفحات، اكتمال النص المستخرج، عدم وجود صور) عبر توليد PDF فعلي بـ Puppeteer. يحتاج تطبيقًا يعمل وبيانات مهيّأة:

```bash
npm run dev &                 # أو npm run build && npm run start
npm run db:seed
TEST_RESUME_ID=<resume-id> TEST_USER_ID=<user-id> npm run test
```

بدون هذين المتغيّرين، تُتخطّى الاختبارات (لا تفشل) — مفيد على checkout جديد بلا بيئة حيّة. اختبار واحد معطَّل عمدًا (`it.skip`) لقيد معروف موثّق في `docs/DECISIONS.md` (ترتيب الكلمات في النص العربي المستخرج).

## أوامر قاعدة البيانات

```bash
npm run db:generate   # توليد هجرة جديدة من التغييرات في src/db/schema
npm run db:migrate     # تطبيق الهجرات على القاعدة
npm run db:push        # مزامنة مباشرة (تطوير فقط)
npm run db:studio      # واجهة Drizzle Studio لتصفّح البيانات
npm run db:seed        # تعبئة بيانات تجريبية
```

## بنية المشروع

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (marketing)/page.tsx     # الصفحة الرئيسية
│   │   ├── (auth)/login|verify      # المرحلة 2 — OTP
│   │   ├── (app)/dashboard|builder  # المرحلة 2 (شل أولي) + 3-5 (الميزات الكاملة)
│   │   └── (admin)/admin            # المرحلة 2 (شل أولي) + 8 (الميزات الكاملة: إحصائيات، سير، مستخدمون)
│   ├── print/[resumeId]             # المرحلة 5 — جذر HTML مستقل بلا next-intl
│   └── api/export/pdf               # المرحلة 6 — Route Handler (Puppeteer)
├── components/
│   ├── ui/                          # shadcn
│   ├── auth/                        # المرحلة 2
│   ├── builder/                     # المراحل 3-6 — StepProgress، FieldWithExample*، MonthYearPicker،
│   │                                 # SortableItemList (dnd-kit)، نماذج كل قسم، أقسام مخصصة، معاينة حيّة، أزرار الطباعة/PDF
│   ├── shared/                      # FieldLabel, FieldWithExample, FormFieldMessage, EmptyState،
│   │                                 # SiteHeader، LocaleSwitcher — المرحلة 9
│   ├── resume/                      # ResumePrintTemplate, AutoPrintTrigger — المرحلة 5
│   └── admin/                       # المرحلة 8 — AdminNav، StatCard/TimelineChart/FunnelCard، ResumesTable/UsersTable،
│                                     # ResumeEditSheet، ConfirmDeleteDialog
├── db/{schema,migrations,index.ts,seed.ts}   # المرحلة 1
├── server/
│   ├── services/{auth,resume,resume-items,resume-sections,resume-exports,pdf-export,admin-stats,admin-resumes,admin-users,audit-log}.service.ts   # المراحل 2-6، 8
│   └── repositories/{users,otp-codes,resumes,resume-sections,resume-items,exports,admin-stats,admin-resumes,admin-users,audit-log}.repository.ts
├── actions/{auth,resume,resume-items,resume-sections,resume-exports,admin-resumes,admin-users}.actions.ts   # Server Actions
├── hooks/{use-autosave-form,use-item-form,use-section-items,use-items-for-section,use-admin-query-params}.ts
├── lib/
│   ├── auth/{jwt,otp,session,mailer,error-messages,export-token}.ts   # المراحل 2، 6
│   ├── pdf/{generate-resume-pdf,filename}.ts        # المرحلة 6
│   ├── storage/s3.ts                                # المرحلة 6
│   ├── admin/csv.ts                                 # المرحلة 8
│   ├── validations/resume/{personal-info,summary,experience,education,skills,certifications,languages,custom-section,export-pdf}.ts
│   ├── validations/admin.ts                         # المرحلة 8
│   ├── constants/{builder,field-guides,resume-sections,auth,print-labels}.ts
│   ├── ats/ errors.ts logger.ts env.ts
├── i18n/{routing.ts,request.ts,navigation.ts,messages/}
└── proxy.ts                         # توجيه اللغة + حماية المسارات (بديل middleware في Next 16؛ يستثني /print)
```
\* `FieldWithExample` تعيش في `components/shared/` لأنها عامة عبر التطبيق، لا خاصة بالمعالج فقط.

## النشر على CranL (الإنتاج)

المشروع مُعدّ للنشر كحاوية Docker واحدة (`Dockerfile` — بناء متعدد المراحل، مخرجات Next.js `standalone`).

### 1. تجهيز البنية التحتية على CranL

1. **Database** → أنشئ خدمة PostgreSQL 16 → انسخ `DATABASE_URL` الناتج.
2. **S3 Storage** → أنشئ bucket باسم `seera-exports` → احفظ `S3_ENDPOINT` / `S3_ACCESS_KEY` / `S3_SECRET_KEY`.
3. **Emails** → اضبط مرسلًا واحصل على بيانات SMTP (`SMTP_HOST/PORT/USER/PASS`) و`MAIL_FROM`.

### 2. متغيرات البيئة المطلوبة في الإنتاج

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.example      # بلا / في النهاية
DATABASE_URL=postgres://user:pass@host:5432/seera
JWT_SECRET=                                            # 32+ حرفًا عشوائيًا (openssl rand -base64 32)
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS= MAIL_FROM=
S3_ENDPOINT= S3_BUCKET=seera-exports S3_ACCESS_KEY= S3_SECRET_KEY=
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium            # مضبوط مسبقًا داخل Dockerfile
```

`src/lib/env.ts` يتحقق من كل متغيّر بـ Zod عند الإقلاع ويُفشل التشغيل فورًا إن نقص أي منها — لا يمكن نشر نسخة بإعدادات ناقصة صامتة.

### 3. النشر عبر CranL

1. **Applications → Application from Git** → اربط مستودع GitHub الخاص بالمشروع.
2. اختر **Dockerfile** كطريقة البناء (يُكتشف تلقائيًا من جذر المستودع) — لا حاجة لإعداد Buildpack يدويًا.
3. المنفذ: **3000** (مطابق لـ `EXPOSE 3000` و`ENV PORT=3000` في `Dockerfile`).
4. الصق متغيرات البيئة أعلاه في إعدادات التطبيق.
5. **Deploy**. أول تشغيل يحتاج تطبيق الهجرات يدويًا مرة واحدة (راجع الخطوة 4 أدناه).
6. (اختياري) **Templates → Drizzle Gateway** لإدارة قاعدة البيانات بواجهة رسومية بدل CLI.

### 4. تطبيق الهجرات على قاعدة إنتاج

`npm run db:migrate` يحتاج تشغيلًا لمرة واحدة بعد أول نشر (ولاحقًا بعد كل هجرة جديدة). إن أتاح CranL تشغيل أمر داخل الحاوية:

```bash
DATABASE_URL=<رابط قاعدة الإنتاج> npx drizzle-kit migrate
```

وإلا، شغّله محليًا مؤقتًا بمتغيّر `DATABASE_URL` يشير لقاعدة الإنتاج (تأكد أن القاعدة تسمح باتصالات خارجية أثناء ذلك فقط).

### لماذا Dockerfile يحتاج Chromium مثبَّتًا في النظام لا حزمة Puppeteer المجمَّعة؟

راجع `docs/DECISIONS.md` — باختصار: صورة الإنتاج تثبّت `chromium` و`fonts-noto-core`/`fonts-noto-cjk` عبر `apt-get` مباشرة (بدل الاعتماد على نسخة Chromium التي تنزّلها حزمة `puppeteer` تلقائيًا عند `npm install`)، لأن هذا يقلّل حجم الصورة النهائية، ويضمن توفّر خط "Noto Naskh Arabic" على مستوى النظام الذي يعتمد عليه `local()` في `print.css` (`docs/DECISIONS.md`، قيد استخراج النص العربي في المرحلة 6). مرحلة البناء تضبط `PUPPETEER_SKIP_DOWNLOAD=true` لتفادي تنزيل نسخة Chromium غير المستخدَمة أصلًا.

## حالة المراحل

- [x] **المرحلة 0** — التهيئة: Next.js + TS strict + Tailwind v4 + shadcn + next-intl (ar/en + RTL) + ESLint/Prettier + بنية المجلدات + `docs/DECISIONS.md`. `npm run build` ينجح.
- [x] **المرحلة 1** — قاعدة البيانات: Drizzle schema كامل (users, otp_codes, resumes, resume_sections, resume_items, exports, audit_log) + هجرة أولى (تُفعّل `citext`) + `seed.ts` + اتصال ناجح بـ PostgreSQL محلي عبر Docker. `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 2** — المصادقة: بريد → OTP (مُرسَل فعليًا عبر Mailhog محليًا) → JWT في httpOnly cookie + `proxy.ts` يحمي `/dashboard` و`/builder` و`/admin` ويحوّل حسب اللغة + صفحات `login`/`verify` (RHF + Zod) + تحديد معدل الطلب (3 رموز/10 دقائق) + دور `admin` بدفاع بطبقتين (middleware + `requireAdmin()` في الصفحة). اختُبر التدفق كاملًا في المتصفح (تسجيل دخول مستخدم، حماية `/dashboard` بعد الخروج، منع مستخدم عادي من `/admin`، دخول أدمن ناجح، تفعيل تحديد المعدل). `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 3** — نواة المعالج: Builder shell (شريط تقدّم 9 خطوات بحالة مكتمل/ناقص/فارغ + معاينة حيّة فورية Desktop/Sheet للجوال + أزرار السابق/التالي) + حفظ تلقائي (debounce 1.5 ثانية + مؤشر "تم الحفظ ✓") + `<FieldWithExample>` (تلميح دائم + Tooltip + مثال قابل للطي مع زر "استخدم هذا المثال") + `<MonthYearPicker>` (جاهز لاستهلاك المرحلة 4) + خطوتا المعلومات الشخصية والملخص كاملتين بـ RHF/Zod (مخطط صارم للواجهة + `.partial()` للحفظ التلقائي من السيرفر) + عنوان السيرة يتزامن تلقائيًا مع الاسم. لوحة التحكم تعرض سير المستخدم مع إمكانية إنشاء سيرة جديدة والدخول لتعديل أي سيرة محفوظة. اختُبر التدفق كاملًا في المتصفح: إنشاء سيرة، تعبئة الحقول، تحقّق الحفظ التلقائي من قاعدة البيانات مباشرة، زر "استخدم المثال"، انتقال بين الخطوتين، وتحديث شارات الإكمال في شريط التقدّم. `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 4** — بقية الأقسام: خطوات 3-7 (الخبرات، التعليم، المهارات، الشهادات، اللغات) كل واحدة بقائمة عناصر قابلة للإضافة/الحذف/إعادة الترتيب بالسحب (`@dnd-kit`) وحفظ تلقائي مستقل لكل عنصر + `<MonthYearPicker>` مُستهلَك فعليًا في الخبرات/الشهادات + التحقق من تسلسل التواريخ (`superRefine`) + الأقسام المخصصة (خطوة 8): حوار إضافة قسم بثلاثة أنواع محتوى (نقاط/عناصر بتواريخ/نص)، تحذير للعناوين غير القياسية، إظهار/إخفاء وحذف وإعادة ترتيب لكل الأقسام معًا (المعلومات الشخصية مثبّتة أولًا دائمًا) + المعاينة الحيّة تعرض كل الأقسام. كل عملية (إضافة/حفظ/حذف/إعادة ترتيب) تتحقق من ملكية المستخدم عبر سلسلة item→section→resume→user. اختُبر التدفق كاملًا في المتصفح: إضافة/حذف خبرة مع تحقق فوري من قاعدة البيانات، إنشاء قسم مخصص وإضافة عنصر له، وتحقق تحذير العنوان غير القياسي. عولج خطأ اكتُشف أثناء الاختبار (`useFormField` بلا `FormItem` في نماذج الأقسام المخصصة) وخطأ hydration في dnd-kit (`id` صريح لكل `DndContext`). `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 5** — المعاينة والطباعة: صفحة [`/print/[resumeId]?lang=ar|en`](src/app/print/[resumeId]/page.tsx) — جذر HTML مستقل (بلا next-intl، بلا هيدر/تنقّل) يعرض [`<ResumePrintTemplate>`](src/components/resume/resume-print-template.tsx) بعمود واحد وبلا ألوان مطابقًا تمامًا لقواعد `ATS-CRITERIA.md` (خطوط قياسية، تواريخ MM/YYYY، نقطة `•` فقط) + `print.css` مع `@page { size: A4; margin: 20mm 18mm }` + خطوة "المراجعة والتصدير" (9) بزرَي طباعة عربي/إنجليزي يفتحان تبويبًا جديدًا يستدعي `window.print()` تلقائيًا + تسجيل كل عملية في جدول `exports` مع تحديث حالة السيرة إلى `completed` عند أول تصدير. اختُبر يدويًا بالعربي والإنجليزي في المتصفح: تحقق فوري من صف `exports` وتغيّر حالة السيرة في قاعدة البيانات، وتأكيد بصري لعمود واحد نظيف بلا ألوان لكلتا اللغتين. زرا "تحميل PDF" و"إرسال نسخة" لم يُبنيا بعد (يحتاجان Puppeteer من المرحلة 6) — موثّق في `docs/DECISIONS.md`، مع قيد معروف حول حقول المدينة/الشركة غير المقسّمة لغويًا في الخبرات. `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 6** — PDF على السيرفر: زرا "تحميل PDF" (عربي/إنجليزي) في خطوة المراجعة → [`POST /api/export/pdf`](src/app/api/export/pdf/route.ts) → [`generateResumePdf()`](src/lib/pdf/generate-resume-pdf.ts) يفتح `/print` بتوكن تصدير قصير الأمد (`lib/auth/export-token.ts`، دقيقتان) عبر Puppeteer، ينتظر `document.fonts.ready`، يولّد PDF (A4, بلا خلفيات) → يُرفع إلى MinIO محليًا (يحاكي S3) → رابط موقّع صالح 15 دقيقة + تسجيل `exports` (method: pdf) + تحديد معدّل الطلب (5/10 دقائق) + اسم ملف منظَّف `{Name}_{JobTitle}.pdf`. خطوط مضمّنة ذاتيًا (`public/fonts`, Arimo بدل Liberation Sans) مع تفضيل النسخة المثبَّتة على النظام عبر `local()`. اختُبرت السلسلة كاملة فعليًا: توليد PDF حقيقي (82KB، صفحة واحدة)، تحقّق مباشر من الرفع لـ MinIO والرابط الموقّع، واستخراج النص بـ `pdf-parse` (اختبار Vitest آلي في `test/pdf-export.test.ts`). **⚠️ اكتُشف قيد جوهري غير محلول بالكامل**: استخراج النص العربي من PDF (Chromium/Skia) يعطي إما حروفًا منفصلة معكوسة أو حروفًا صحيحة بترتيب كلمات معكوس حسب الخط — حُقِّق فيه لساعات (موثّق بالتفصيل في `docs/DECISIONS.md`)، لا حل كامل حاليًا؛ النص الإنجليزي يُستخرج بشكل صحيح تمامًا، والعرض المرئي (طباعة/PDF كلاهما) صحيح 100% في كل الحالات — القيد يخص فقط طبقة النص الخفية القابلة للنسخ في الملف العربي. `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 7** — محرك ATS: [`calculateAtsScore()`](src/lib/ats/score.ts) — دالة نقية (client-side) تحسب نتيجة 0-100 عبر 5 محاور موزونة بالضبط كما في `ATS-CRITERIA.md` §4 (الاكتمال 30، التواريخ 20، جودة الصياغة 25، الكلمات المفتاحية 15، التوافق التقني 10)، مقسّمة لملفات مستقلة لكل محور (`completeness.ts`, `dates.ts`, `writing-quality.ts`, `keywords.ts`, `technical.ts`). [`<AtsScoreCard>`](src/components/builder/ats-score-card.tsx) في خطوة المراجعة: شريط ملوّن (أحمر/كهرماني/أخضر)، قائمة "أصلح هذا" بأزرار تنقل مباشرة للقسم المعني، وحقل لصق نص الإعلان الوظيفي لمطابقة الكلمات المفتاحية — النتيجة تُحفظ تلقائيًا في `resumes.ats_score`. اختُبر حيًا في المتصفح: النتيجة، تحديثها الفوري عند لصق إعلان وظيفي (97→90 مع عرض الكلمات الناقصة)، والتحقق من قيمة `ats_score` في قاعدة البيانات مباشرة. 6 اختبارات Vitest وحدة (`test/ats-score.test.ts`) تغطي: نتيجة عالية لسيرة كاملة، نتيجة منخفضة لسيرة فارغة مع قائمة الأسباب، مطابقة الكلمات المفتاحية، رصد الأرقام الهندية، ورصد الفجوات الزمنية. اكتُشف وأُصلح أثناء العمل: مفاتيح ترجمة مزدوجة البادئة، وخطأ سابق (منذ المرحلة 4) في مدقق الروابط يرفض `linkedin.com/in/x` بلا بروتوكول. `npm run lint/typecheck/build` و`npm run test` تنجح.
- [x] **المرحلة 8** — لوحة تحكم الأدمن: تبويبات "الإحصائيات/السير الذاتية/المستخدمون" ([`(admin)/admin/*`](src/app/[locale]/(admin)/admin)) — **الإحصائيات**: فلتر فترة (7/30/90 يومًا)، 8 بطاقات (مستخدمون، سير، مكتملة، معدل الإكمال، تصدير عربي/إنجليزي، متوسط ATS، مستخدمون جدد)، مخطط خطي للنشاط عبر الزمن، مخطط أعمدة للتصدير حسب اللغة، وبطاقة مسار تحويل (تسجيل → إنشاء سيرة → إكمال → تصدير). **السير الذاتية**: جدول [`<AdminResumesTable>`](src/components/admin/resumes-table.tsx) بترقيم صفحات وفرز وفلترة (حالة/لغة تصدير) وبحث تُقاد كلها عبر رابط الصفحة ([`useAdminQueryParams`](src/hooks/use-admin-query-params.ts))، تحديد جماعي وحذف ناعم جماعي، تصدير CSV/XLSX يحترم الفلاتر الحالية، وشريحة تعديل ([`<ResumeEditSheet>`](src/components/admin/resume-edit-sheet.tsx)) لعرض/تعديل العنوان والحالة مع رابط معاينة `/print`. **المستخدمون**: جدول مشابه (بحث/فلتر دور)، تغيير الدور، وتفعيل/تعطيل الحساب (يعيد استخدام `deleted_at`). كل عملية تحوير (حذف، حذف جماعي، تعديل، تغيير دور، تفعيل/تعطيل) تمر بـ `requireAdmin()` ثم تُسجَّل في `audit_log` عبر [`logAdminAction()`](src/server/services/audit-log.service.ts)، وتتطلب عمليات الحذف كتابة كلمة "حذف" حرفيًا للتأكيد ([`<ConfirmDeleteDialog>`](src/components/admin/confirm-delete-dialog.tsx)). اختُبرت اللوحة بالكامل حيًا في المتصفح (تسجيل دخول أدمن عبر OTP فعلي من Mailhog، كل تبويب، كل فلتر، الفرز، التعديل، الحذف مع الإلغاء، التفعيل/التعطيل، تغيير الدور، تصدير CSV/XLSX). **اكتُشفت وأُصلحت 3 أخطاء حقيقية أثناء الاختبار الحي** (موثّقة بالتفصيل في `docs/DECISIONS.md`): (1) شريحة تعديل السيرة لا تملأ الحقول عند الفتح — أُصلح بمفتاح `key` يجبر إعادة إنشاء المكوّن؛ (2) عدد سير المستخدم يظهر 0 دائمًا بسبب استعلام SQL فرعي بأعمدة غير مؤهَّلة بأسماء الجداول — أُصلح باستخدام Query Builder بدل `sql` خام؛ (3) الجداول لا تتحدّث بعد أي تحوير بسبب عدم إبطال تخزين Next.js المؤقت للموجّه — أُصلح بـ `router.refresh()` صريحة بدل `router.push()` لنفس الرابط. `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 9** — الصقل: **الصفحة الرئيسية** ([`(marketing)/page.tsx`](src/app/[locale]/(marketing)/page.tsx)) وُسِّعت من عنوان رئيسي فقط إلى صفحة كاملة: [`<SiteHeader>`](src/components/shared/site-header.tsx) (شعار + [`<LocaleSwitcher>`](src/components/shared/locale-switcher.tsx) + زر دخول) + قسم بطل + 4 بطاقات ميزات + قسم "كيف تعمل المنصة؟" (3 خطوات) + دعوة ختامية + تذييل. **SEO**: `metadataBase` + Open Graph + Twitter Card في [`[locale]/layout.tsx`](src/app/[locale]/layout.tsx)، [`opengraph-image.tsx`](src/app/opengraph-image.tsx) (صورة مولَّدة ديناميكيًا عبر `next/og`)، [`icon.svg`](src/app/icon.svg) (أيقونة تبويب)، [`sitemap.ts`](src/app/sitemap.ts) و[`robots.ts`](src/app/robots.ts) (يستثنيان المسارات المحمية). **إتاحة الوصول (a11y)**: `aria-label` لكل عنصر تحكم بلا نص مرئي (صناديق الاختيار، زر إجراءات الصف "..."). **حالات فارغة وهياكل تحميل**: [`<EmptyState>`](src/components/shared/empty-state.tsx) عام يُستخدم في لوحة المستخدم وجدولي الأدمن، و`loading.tsx` (هياكل [`<Skeleton>`](src/components/ui/skeleton.tsx)) للوحة المستخدم وكل تبويبات الأدمن. **اختبار الجوال**: تحقّق فعلي بمحاكي 375×812 للصفحة الرئيسية (عربي/إنجليزي) ولوحتي المستخدم/الأدمن — الجداول تمرَّر أفقيًا داخل حاويتها دون كسر تخطيط الصفحة. **الوضع الليلي اختياري لم يُبنَ** (موثَّق في `docs/DECISIONS.md`) — متغيرات `.dark` جاهزة أصلًا في `globals.css` منذ المرحلة 0. **اكتُشف وأُصلح خطأ حقيقي رابع**: `/opengraph-image` كان يُعيد 404 لأن `proxy.ts` (next-intl middleware) عامله كصفحة عادية تحتاج بادئة لغة؛ أُضيف استثناء صريح في نمط الـ`matcher`. `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 10** — النشر على CranL: [`Dockerfile`](Dockerfile) متعدد المراحل (`deps` → `builder` → `runner`) بمخرجات Next.js `standalone` (`output: "standalone"` في `next.config.ts`) — الصورة النهائية تثبّت `chromium` و`fonts-noto-core`/`fonts-noto-cjk` عبر `apt-get` مباشرة (مطابق حرفيًا لـ PROJECT-BRIEF §6.6)، مع `PUPPETEER_SKIP_DOWNLOAD=true` في مرحلتي البناء لتفادي تنزيل نسخة Chromium المجمَّعة غير المستخدَمة، ومستخدم غير-جذر (`nextjs`) لتشغيل الحاوية. [`.dockerignore`](.dockerignore) يستثني `node_modules`/`.git`/`docs`/الاختبارات من سياق البناء. قسم **"النشر على CranL"** الجديد في هذا الملف (أعلاه) يوثّق: تجهيز البنية التحتية (Database/S3/Emails)، كل متغيرات البيئة المطلوبة في الإنتاج، خطوات النشر عبر واجهة CranL، وكيفية تطبيق الهجرات على قاعدة إنتاج بعد أول نشر. **تحقّق فعلي كامل محليًا** (لا افتراضي): بُنيت الصورة فعليًا بـ `docker build` ونجحت، ثم شُغِّلت حاوية حقيقية بمتغيرات بيئة تشير لخدمات Docker Compose المحلية عبر `host.docker.internal` — الخادم أقلع، الصفحات العامة أعادت `200` والمسارات المحمية `307` (إعادة توجيه صحيحة لغير المُصادَق)، وتحقّقنا من عمل ثنائي Chromium النظامي فعليًا داخل الحاوية. `npm run lint/typecheck/build` تنجح محليًا وداخل مرحلة `builder` في الصورة على حدٍّ سواء.
