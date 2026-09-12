import { z } from "zod";

export const exportPdfRequestSchema = z.object({
  resumeId: z.string().uuid(),
  lang: z.enum(["ar", "en"]),
});

export type ExportPdfRequest = z.infer<typeof exportPdfRequestSchema>;
