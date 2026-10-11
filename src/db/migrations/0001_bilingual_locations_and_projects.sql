-- Data-only migration (no schema change): item data lives in jsonb.
--
-- 1) Work experience: the single `company` / `cityCountry` fields become
--    bilingual (`companyAr`/`companyEn`, `cityCountryAr`/`cityCountryEn`),
--    and every entry gets an `employmentType` (defaults to full-time).
--    A value written in Arabic script is kept for the Arabic resume only;
--    a Latin-script value is copied to both, since it reads fine in either.
UPDATE "resume_items" AS ri
SET "data" = (ri."data" - 'company' - 'cityCountry') || jsonb_build_object(
  'companyAr', COALESCE(ri."data"->>'company', ''),
  'companyEn', CASE WHEN COALESCE(ri."data"->>'company', '') ~ '[؀-ۿ]' THEN '' ELSE COALESCE(ri."data"->>'company', '') END,
  'cityCountryAr', COALESCE(ri."data"->>'cityCountry', ''),
  'cityCountryEn', CASE WHEN COALESCE(ri."data"->>'cityCountry', '') ~ '[؀-ۿ]' THEN '' ELSE COALESCE(ri."data"->>'cityCountry', '') END,
  'employmentType', COALESCE(ri."data"->>'employmentType', 'full_time')
)
FROM "resume_sections" AS rs
WHERE ri."section_id" = rs."id"
  AND rs."type" = 'experience'
  AND (ri."data" ? 'company' OR ri."data" ? 'cityCountry');
--> statement-breakpoint
-- 2) Education: `cityCountry` becomes `cityCountryAr`/`cityCountryEn`, same rule.
UPDATE "resume_items" AS ri
SET "data" = (ri."data" - 'cityCountry') || jsonb_build_object(
  'cityCountryAr', COALESCE(ri."data"->>'cityCountry', ''),
  'cityCountryEn', CASE WHEN COALESCE(ri."data"->>'cityCountry', '') ~ '[؀-ۿ]' THEN '' ELSE COALESCE(ri."data"->>'cityCountry', '') END
)
FROM "resume_sections" AS rs
WHERE ri."section_id" = rs."id"
  AND rs."type" = 'education'
  AND ri."data" ? 'cityCountry';
--> statement-breakpoint
-- 3) Every existing resume gets the new standard "Projects" section, appended
--    after its current last section (the user can reorder it).
INSERT INTO "resume_sections" ("resume_id", "type", "title_ar", "title_en", "layout", "sort_order", "is_visible", "is_custom")
SELECT r."id", 'projects', 'المشاريع', 'Projects', 'dated_entries', COALESCE(MAX(s."sort_order"), 0) + 1, true, false
FROM "resumes" AS r
LEFT JOIN "resume_sections" AS s ON s."resume_id" = r."id"
WHERE NOT EXISTS (
  SELECT 1 FROM "resume_sections" AS p WHERE p."resume_id" = r."id" AND p."type" = 'projects'
)
GROUP BY r."id";
