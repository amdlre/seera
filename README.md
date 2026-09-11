# سِيرة (Seera)

منصّة عربية/إنجليزية لبناء سيرة ذاتية تجتاز أنظمة تتبّع المتقدمين (ATS)، بخطوات مشروحة بأمثلة جاهزة لكل حقل.

راجع `PROJECT-BRIEF.md` للرؤية والخطة الكاملة، `CLAUDE.md` لقواعد الكود، و`ATS-CRITERIA.md` لمعايير المحتوى والتنسيق.

## الحزمة التقنية (المرحلة 0)

- Next.js 16 (App Router + Turbopack + React 19)
- TypeScript strict
- Tailwind CSS v4 + shadcn/ui (preset: Radix/Nova)
- next-intl (`ar` افتراضي، `en`) مع دعم RTL/LTR كامل
- react-hook-form + zod (يُستخدم بدءًا من المرحلة 3)
- ESLint (صارم) + Prettier

## التشغيل محليًا

```bash
npm install
npm run dev
```

يفتح على `http://localhost:3000/ar` (أو `/en`).

## أوامر الجودة

```bash
npm run lint
npm run typecheck
npm run build
npm run format
```

## بنية المشروع

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (marketing)/page.tsx     # الصفحة الرئيسية
│   │   ├── (auth)/login|verify      # المرحلة 2
│   │   ├── (app)/dashboard|builder  # المراحل 3-4
│   │   └── (admin)/admin            # المرحلة 8
│   ├── print/[resumeId]             # المرحلة 5
│   └── api/export|admin             # المراحل 6، 8
├── components/{ui,builder,resume,admin,shared}
├── db/{schema,migrations}           # المرحلة 1
├── server/{services,repositories}   # المرحلة 1+
├── actions/                         # Server Actions
├── lib/{ats,validations,constants,auth,errors.ts,logger.ts,env.ts}
├── i18n/{routing.ts,request.ts,navigation.ts,messages/}
└── proxy.ts                         # توجيه اللغة (بديل middleware في Next 16)
```

## حالة المراحل

- [x] **المرحلة 0** — التهيئة: Next.js + TS strict + Tailwind v4 + shadcn + next-intl (ar/en + RTL) + ESLint/Prettier + بنية المجلدات + `docs/DECISIONS.md`. `npm run build` ينجح.
- [ ] المرحلة 1 — قاعدة البيانات (Drizzle + PostgreSQL)
- [ ] المرحلة 2 — المصادقة (OTP + JWT)
- [ ] المرحلة 3 — نواة المعالج
- [ ] المرحلة 4 — بقية الأقسام
- [ ] المرحلة 5 — المعاينة والطباعة
- [ ] المرحلة 6 — PDF على السيرفر
- [ ] المرحلة 7 — محرك ATS
- [ ] المرحلة 8 — لوحة التحكم
- [ ] المرحلة 9 — الصقل
- [ ] المرحلة 10 — النشر على CranL
