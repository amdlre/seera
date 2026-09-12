import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { buildCsv } from "@/lib/admin/csv";
import type { AdminResumeFilters } from "@/server/repositories/admin-resumes.repository";
import { listResumes } from "@/server/services/admin-resumes.service";

const EXPORT_COLUMNS = [
  { key: "userFullName" as const, label: "User" },
  { key: "userEmail" as const, label: "Email" },
  { key: "title" as const, label: "Resume Title" },
  { key: "status" as const, label: "Status" },
  { key: "atsScore" as const, label: "ATS Score" },
  { key: "updatedAt" as const, label: "Last Updated" },
  { key: "exportsAr" as const, label: "Exports (AR)" },
  { key: "exportsEn" as const, label: "Exports (EN)" },
];

function parseFilters(searchParams: URLSearchParams): AdminResumeFilters {
  const status = searchParams.get("status");
  const exportLanguage = searchParams.get("exportLanguage");

  return {
    search: searchParams.get("search") ?? undefined,
    status: status === "draft" || status === "completed" ? status : undefined,
    exportLanguage: exportLanguage === "ar" || exportLanguage === "en" ? exportLanguage : undefined,
    atsMin: searchParams.has("atsMin") ? Number(searchParams.get("atsMin")) : undefined,
    atsMax: searchParams.has("atsMax") ? Number(searchParams.get("atsMax")) : undefined,
    dateFrom: searchParams.has("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
    dateTo: searchParams.has("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
    page: 1,
    pageSize: 10_000,
  };
}

/** Exports the admin resumes table (respecting current filters) as CSV or XLSX. */
export async function GET(request: Request): Promise<NextResponse> {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const filters = parseFilters(searchParams);

  const { rows } = await listResumes(filters);
  const tableRows = rows.map((row) => ({
    userFullName: row.userFullName,
    userEmail: row.userEmail,
    title: row.title,
    status: row.status,
    atsScore: row.atsScore,
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
    exportsAr: row.exportsAr,
    exportsEn: row.exportsEn,
  }));

  if (format === "csv") {
    const csv = buildCsv(tableRows, EXPORT_COLUMNS);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="resumes.csv"',
      },
    });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Resumes");
  worksheet.columns = EXPORT_COLUMNS.map((column) => ({ header: column.label, key: column.key }));
  worksheet.addRows(tableRows);

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="resumes.xlsx"',
    },
  });
}
