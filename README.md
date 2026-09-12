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
- ESLint (صارم) + Prettier

## التشغيل محليًا

```bash
cp .env.example .env.local   # عدّل القيم إن لزم (JWT_SECRET عشوائي 32+ حرفًا في الإنتاج)
docker compose up -d          # PostgreSQL 16 (منفذ 5433) + Mailhog لاستقبال بريد OTP محليًا
npm install
npm run db:migrate            # تطبيق الهجرات
npm run db:seed               # بيانات تجريبية (مستخدمان + سيرة كاملة)
npm run dev
```

يفتح على `http://localhost:3000/ar` (أو `/en`).

> ملاحظة: المنفذ المحلي لـ PostgreSQL هو **5433** لا 5432 (راجع `docs/DECISIONS.md`).

### تسجيل الدخول محليًا (OTP)

سجّل الدخول بأي بريد (مثل `basil@seera.dev` من `seed.ts`)، ثم افتح **http://localhost:8025** (واجهة Mailhog) لقراءة رمز الدخول المرسل — لا حاجة لحساب بريد حقيقي في التطوير.

## أوامر الجودة

```bash
npm run lint
npm run typecheck
npm run build
npm run format
```

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
│   │   └── (admin)/admin            # المرحلة 2 (شل أولي) + 8 (الميزات الكاملة)
│   ├── print/[resumeId]             # المرحلة 5 — جذر HTML مستقل بلا next-intl
│   └── api/export|admin             # المراحل 6، 8
├── components/
│   ├── ui/                          # shadcn
│   ├── auth/                        # المرحلة 2
│   ├── builder/                     # المراحل 3-5 — StepProgress، FieldWithExample*، MonthYearPicker،
│   │                                 # SortableItemList (dnd-kit)، نماذج كل قسم، أقسام مخصصة، معاينة حيّة، أزرار الطباعة
│   ├── shared/                      # FieldLabel, FieldWithExample, FormFieldMessage
│   └── resume/                      # ResumePrintTemplate, AutoPrintTrigger — المرحلة 5
├── db/{schema,migrations,index.ts,seed.ts}   # المرحلة 1
├── server/
│   ├── services/{auth,resume,resume-items,resume-sections,resume-exports}.service.ts   # المراحل 2-5
│   └── repositories/{users,otp-codes,resumes,resume-sections,resume-items,exports}.repository.ts
├── actions/{auth,resume,resume-items,resume-sections,resume-exports}.actions.ts   # Server Actions
├── hooks/{use-autosave-form,use-item-form,use-section-items,use-items-for-section}.ts
├── lib/
│   ├── auth/{jwt,otp,session,mailer,error-messages}.ts   # المرحلة 2
│   ├── validations/resume/{personal-info,summary,experience,education,skills,certifications,languages,custom-section}.ts
│   ├── constants/{builder,field-guides,resume-sections,auth,print-labels}.ts
│   ├── ats/ errors.ts logger.ts env.ts
├── i18n/{routing.ts,request.ts,navigation.ts,messages/}
└── proxy.ts                         # توجيه اللغة + حماية المسارات (بديل middleware في Next 16؛ يستثني /print)
```
\* `FieldWithExample` تعيش في `components/shared/` لأنها عامة عبر التطبيق، لا خاصة بالمعالج فقط.

## حالة المراحل

- [x] **المرحلة 0** — التهيئة: Next.js + TS strict + Tailwind v4 + shadcn + next-intl (ar/en + RTL) + ESLint/Prettier + بنية المجلدات + `docs/DECISIONS.md`. `npm run build` ينجح.
- [x] **المرحلة 1** — قاعدة البيانات: Drizzle schema كامل (users, otp_codes, resumes, resume_sections, resume_items, exports, audit_log) + هجرة أولى (تُفعّل `citext`) + `seed.ts` + اتصال ناجح بـ PostgreSQL محلي عبر Docker. `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 2** — المصادقة: بريد → OTP (مُرسَل فعليًا عبر Mailhog محليًا) → JWT في httpOnly cookie + `proxy.ts` يحمي `/dashboard` و`/builder` و`/admin` ويحوّل حسب اللغة + صفحات `login`/`verify` (RHF + Zod) + تحديد معدل الطلب (3 رموز/10 دقائق) + دور `admin` بدفاع بطبقتين (middleware + `requireAdmin()` في الصفحة). اختُبر التدفق كاملًا في المتصفح (تسجيل دخول مستخدم، حماية `/dashboard` بعد الخروج، منع مستخدم عادي من `/admin`، دخول أدمن ناجح، تفعيل تحديد المعدل). `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 3** — نواة المعالج: Builder shell (شريط تقدّم 9 خطوات بحالة مكتمل/ناقص/فارغ + معاينة حيّة فورية Desktop/Sheet للجوال + أزرار السابق/التالي) + حفظ تلقائي (debounce 1.5 ثانية + مؤشر "تم الحفظ ✓") + `<FieldWithExample>` (تلميح دائم + Tooltip + مثال قابل للطي مع زر "استخدم هذا المثال") + `<MonthYearPicker>` (جاهز لاستهلاك المرحلة 4) + خطوتا المعلومات الشخصية والملخص كاملتين بـ RHF/Zod (مخطط صارم للواجهة + `.partial()` للحفظ التلقائي من السيرفر) + عنوان السيرة يتزامن تلقائيًا مع الاسم. لوحة التحكم تعرض سير المستخدم مع إمكانية إنشاء سيرة جديدة والدخول لتعديل أي سيرة محفوظة. اختُبر التدفق كاملًا في المتصفح: إنشاء سيرة، تعبئة الحقول، تحقّق الحفظ التلقائي من قاعدة البيانات مباشرة، زر "استخدم المثال"، انتقال بين الخطوتين، وتحديث شارات الإكمال في شريط التقدّم. `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 4** — بقية الأقسام: خطوات 3-7 (الخبرات، التعليم، المهارات، الشهادات، اللغات) كل واحدة بقائمة عناصر قابلة للإضافة/الحذف/إعادة الترتيب بالسحب (`@dnd-kit`) وحفظ تلقائي مستقل لكل عنصر + `<MonthYearPicker>` مُستهلَك فعليًا في الخبرات/الشهادات + التحقق من تسلسل التواريخ (`superRefine`) + الأقسام المخصصة (خطوة 8): حوار إضافة قسم بثلاثة أنواع محتوى (نقاط/عناصر بتواريخ/نص)، تحذير للعناوين غير القياسية، إظهار/إخفاء وحذف وإعادة ترتيب لكل الأقسام معًا (المعلومات الشخصية مثبّتة أولًا دائمًا) + المعاينة الحيّة تعرض كل الأقسام. كل عملية (إضافة/حفظ/حذف/إعادة ترتيب) تتحقق من ملكية المستخدم عبر سلسلة item→section→resume→user. اختُبر التدفق كاملًا في المتصفح: إضافة/حذف خبرة مع تحقق فوري من قاعدة البيانات، إنشاء قسم مخصص وإضافة عنصر له، وتحقق تحذير العنوان غير القياسي. عولج خطأ اكتُشف أثناء الاختبار (`useFormField` بلا `FormItem` في نماذج الأقسام المخصصة) وخطأ hydration في dnd-kit (`id` صريح لكل `DndContext`). `npm run lint/typecheck/build` تنجح.
- [x] **المرحلة 5** — المعاينة والطباعة: صفحة [`/print/[resumeId]?lang=ar|en`](src/app/print/[resumeId]/page.tsx) — جذر HTML مستقل (بلا next-intl، بلا هيدر/تنقّل) يعرض [`<ResumePrintTemplate>`](src/components/resume/resume-print-template.tsx) بعمود واحد وبلا ألوان مطابقًا تمامًا لقواعد `ATS-CRITERIA.md` (خطوط قياسية، تواريخ MM/YYYY، نقطة `•` فقط) + `print.css` مع `@page { size: A4; margin: 20mm 18mm }` + خطوة "المراجعة والتصدير" (9) بزرَي طباعة عربي/إنجليزي يفتحان تبويبًا جديدًا يستدعي `window.print()` تلقائيًا + تسجيل كل عملية في جدول `exports` مع تحديث حالة السيرة إلى `completed` عند أول تصدير. اختُبر يدويًا بالعربي والإنجليزي في المتصفح: تحقق فوري من صف `exports` وتغيّر حالة السيرة في قاعدة البيانات، وتأكيد بصري لعمود واحد نظيف بلا ألوان لكلتا اللغتين. زرا "تحميل PDF" و"إرسال نسخة" لم يُبنيا بعد (يحتاجان Puppeteer من المرحلة 6) — موثّق في `docs/DECISIONS.md`، مع قيد معروف حول حقول المدينة/الشركة غير المقسّمة لغويًا في الخبرات. `npm run lint/typecheck/build` تنجح.
- [ ] المرحلة 6 — PDF على السيرفر
- [ ] المرحلة 7 — محرك ATS
- [ ] المرحلة 8 — لوحة التحكم
- [ ] المرحلة 9 — الصقل
- [ ] المرحلة 10 — النشر على CranL
