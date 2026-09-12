"use client";

import { ArrowUpDown, FileSearch, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  bulkDeleteResumesAction,
  deleteResumeAsAdminAction,
} from "@/actions/admin-resumes.actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminQueryParams } from "@/hooks/use-admin-query-params";
import type {
  AdminResumeFilters,
  AdminResumeRow,
  AdminResumeSortColumn,
} from "@/server/repositories/admin-resumes.repository";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { ResumeEditSheet } from "./resume-edit-sheet";

export function AdminResumesTable({
  rows,
  total,
  pageSize,
  filters,
}: {
  rows: AdminResumeRow[];
  total: number;
  pageSize: number;
  filters: AdminResumeFilters;
}) {
  const t = useTranslations("admin.resumesTable");
  const { setParams, refresh } = useAdminQueryParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingResume, setEditingResume] = useState<AdminResumeRow | null>(null);
  const [deletingResume, setDeletingResume] = useState<AdminResumeRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function toggleSort(column: AdminResumeSortColumn) {
    const nextDir = filters.sortBy === column && filters.sortDir === "desc" ? "asc" : "desc";
    setParams({ sortBy: column, sortDir: nextDir });
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleDelete() {
    if (!deletingResume) return;
    const result = await deleteResumeAsAdminAction({
      resumeId: deletingResume.id,
      confirmation: "حذف",
    });
    if (!result.success) {
      toast.error(t("deleteFailed"));
      return;
    }
    toast.success(t("deleted"));
    startTransition(refresh);
  }

  async function handleBulkDelete() {
    const result = await bulkDeleteResumesAction({
      resumeIds: [...selectedIds],
      confirmation: "حذف",
    });
    if (!result.success) {
      toast.error(t("deleteFailed"));
      return;
    }
    toast.success(t("bulkDeleted", { count: selectedIds.size }));
    setSelectedIds(new Set());
    startTransition(refresh);
  }

  function exportUrl(format: "csv" | "xlsx"): string {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.exportLanguage) params.set("exportLanguage", filters.exportLanguage);
    params.set("format", format);
    return `/api/admin/export?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={t("searchPlaceholder")}
          defaultValue={filters.search ?? ""}
          onChange={(event) => setParams({ search: event.target.value })}
          className="max-w-xs"
        />
        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) => setParams({ status: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("statusFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="draft">{t("statusDraft")}</SelectItem>
            <SelectItem value="completed">{t("statusCompleted")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.exportLanguage ?? "all"}
          onValueChange={(value) =>
            setParams({ exportLanguage: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("exportLanguageFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allLanguages")}</SelectItem>
            <SelectItem value="ar">{t("arabic")}</SelectItem>
            <SelectItem value="en">{t("english")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="ms-auto flex gap-2">
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
              {t("deleteSelected", { count: selectedIds.size })}
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <a href={exportUrl("csv")}>{t("exportCsv")}</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={exportUrl("xlsx")}>{t("exportXlsx")}</a>
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={FileSearch} title={t("noResults")} description={t("noResultsHint")} />
      ) : (
        <div className="border-border overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label={t("selectAll")}
                    checked={rows.length > 0 && selectedIds.size === rows.length}
                    onCheckedChange={(checked) =>
                      setSelectedIds(checked ? new Set(rows.map((row) => row.id)) : new Set())
                    }
                  />
                </TableHead>
                <TableHead>{t("columnUser")}</TableHead>
                <TableHead>{t("columnEmail")}</TableHead>
                <SortableHead label={t("columnTitle")} column="title" onSort={toggleSort} />
                <SortableHead label={t("columnStatus")} column="status" onSort={toggleSort} />
                <SortableHead label={t("columnAts")} column="atsScore" onSort={toggleSort} />
                <SortableHead label={t("columnUpdated")} column="updatedAt" onSort={toggleSort} />
                <TableHead>{t("columnExports")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      aria-label={t("selectRow", { title: row.title })}
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={(checked) => toggleRow(row.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell>{row.userFullName}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{row.userEmail}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "completed" ? "default" : "secondary"}>
                      {row.status === "completed" ? t("statusCompleted") : t("statusDraft")}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.atsScore}</TableCell>
                  <TableCell className="text-xs">{row.updatedAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs">
                    AR {row.exportsAr} · EN {row.exportsEn}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={t("rowActions")}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingResume(row)}>
                          {t("viewEdit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingResume(row)}
                        >
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("totalCount", { count: total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page <= 1}
            onClick={() => setParams({ page: filters.page - 1 })}
          >
            {t("previous")}
          </Button>
          <span className="text-muted-foreground">
            {t("pageOf", { page: filters.page, totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page >= totalPages}
            onClick={() => setParams({ page: filters.page + 1 })}
          >
            {t("next")}
          </Button>
        </div>
      </div>

      <ResumeEditSheet
        key={editingResume?.id ?? "closed"}
        resume={editingResume}
        open={editingResume !== null}
        onOpenChange={(open) => !open && setEditingResume(null)}
        onSaved={() => startTransition(refresh)}
      />
      <ConfirmDeleteDialog
        open={deletingResume !== null}
        onOpenChange={(open) => !open && setDeletingResume(null)}
        description={t("deleteDescription", { title: deletingResume?.title ?? "" })}
        onConfirm={handleDelete}
      />
      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        description={t("bulkDeleteDescription", { count: selectedIds.size })}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}

function SortableHead({
  label,
  column,
  onSort,
}: {
  label: string;
  column: AdminResumeSortColumn;
  onSort: (column: AdminResumeSortColumn) => void;
}) {
  return (
    <TableHead>
      <button type="button" onClick={() => onSort(column)} className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="size-3" />
      </button>
    </TableHead>
  );
}
