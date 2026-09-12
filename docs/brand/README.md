# سِيرة — ملفات الهوية

كل الملفات SVG متجهية، النص محوّل إلى مسارات (لا تعتمد على وجود الخط في جهاز المستخدم).
الخط الأصلي: IBM Plex Sans Arabic Medium (رخصة OFL).

| الملف | الاستخدام |
|---|---|
| `seera-logo-ar-{blue,black,white}.svg` | الشعار العربي الكامل |
| `seera-logo-en-{blue,black,white}.svg` | الشعار الإنجليزي الكامل |
| `seera-icon-{blue,black,white}.svg` | الأيقونة وحدها (مربّعة) — للتطبيق والمشاركة |
| `seera-favicon-{blue,black,white}.svg` | نسخة صلبة مبسّطة للـ favicon (16–32px) |
| `*-currentcolor.svg` | تأخذ لونها من CSS (`color`) — الأنسب للوضع الليلي/النهاري |

## الاستخدام في Next.js

**الشعار في الترويسة (يتبع الثيم تلقائيًا):** ضع النسخة `currentcolor` كمكوّن React مضمّن (inline)،
لأن `<img>` لا يورّث `currentColor`:

```tsx
// src/components/shared/logo.tsx
import LogoAr from '@/assets/brand/seera-logo-ar-currentcolor.svg'   // مع @svgr/webpack
export function Logo() {
  return <LogoAr className="h-8 w-auto text-foreground" aria-label="سِيرة" />
}
```

**الـ favicon:**
```
src/app/icon.svg          ← seera-favicon-blue.svg
src/app/apple-icon.png    ← صدّر seera-icon-blue.svg إلى 180×180
```

## قواعد الاستخدام
- أقل ارتفاع للشعار الكامل: 24px. تحته استخدم الأيقونة.
- المسافة الآمنة حول الشعار: ارتفاع الأيقونة ÷ 2.
- لا تلوّنه بلون غير الأزرق `#2563EB` أو الأسود أو الأبيض.
- لا تمدّه ولا تدره ولا تضف له ظلًا.
