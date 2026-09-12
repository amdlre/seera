"use client";

import { ShieldBan, UserSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setUserDisabledAction, updateUserRoleAction } from "@/actions/admin-users.actions";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import type { AdminUserFilters, AdminUserRow } from "@/server/repositories/admin-users.repository";
import { cn } from "@/lib/utils";

const CELL_SPACING = "[&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3";

export function AdminUsersTable({
  rows,
  total,
  pageSize,
  filters,
}: {
  rows: AdminUserRow[];
  total: number;
  pageSize: number;
  filters: AdminUserFilters;
}) {
  const t = useTranslations("admin.usersTable");
  const tGlobal = useTranslations();
  const { setParams, refresh } = useAdminQueryParams();
  const [pendingBlock, setPendingBlock] = useState<AdminUserRow | null>(null);
  const [isBlocking, startBlocking] = useTransition();
  const [, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function handleRoleChange(userId: string, role: "user" | "admin") {
    const result = await updateUserRoleAction({ userId, role });
    if (!result.success) {
      toast.error(tGlobal(result.messageKey));
      return;
    }
    toast.success(t("roleUpdated"));
    startTransition(refresh);
  }

  function setDisabled(user: AdminUserRow, disabled: boolean) {
    startBlocking(async () => {
      const result = await setUserDisabledAction({ userId: user.id, disabled });
      if (!result.success) {
        toast.error(tGlobal(result.messageKey));
        return;
      }
      toast.success(disabled ? t("userDisabled") : t("userEnabled"));
      setPendingBlock(null);
      refresh();
    });
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
          value={filters.role ?? "all"}
          onValueChange={(value) => setParams({ role: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("roleFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allRoles")}</SelectItem>
            <SelectItem value="user">{t("roleUser")}</SelectItem>
            <SelectItem value="admin">{t("roleAdmin")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={UserSearch} title={t("noResults")} description={t("noResultsHint")} />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <Table className={CELL_SPACING}>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("columnEmail")}</TableHead>
                <TableHead>{t("columnRole")}</TableHead>
                <TableHead>{t("columnResumeCount")}</TableHead>
                <TableHead>{t("columnJoined")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const blocked = row.deletedAt !== null;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.fullName}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{row.email}</TableCell>
                    <TableCell>
                      <Select
                        value={row.role}
                        onValueChange={(value) =>
                          handleRoleChange(row.id, value as "user" | "admin")
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t("roleUser")}</SelectItem>
                          <SelectItem value="admin">{t("roleAdmin")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="tabular-nums">{row.resumeCount}</TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {row.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                          blocked
                            ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            blocked ? "bg-rose-500" : "bg-emerald-500",
                          )}
                        />
                        {blocked ? t("statusDisabled") : t("statusActive")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={blocked ? "outline" : "ghost"}
                        size="sm"
                        className={cn(!blocked && "text-destructive hover:text-destructive")}
                        onClick={() => (blocked ? setDisabled(row, false) : setPendingBlock(row))}
                      >
                        {blocked ? t("enable") : t("disable")}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      <AlertDialog open={pendingBlock !== null} onOpenChange={(open) => !open && setPendingBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldBan className="text-destructive size-5" aria-hidden="true" />
              {t("blockTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("blockWarning", { name: pendingBlock?.fullName ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("blockCancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isBlocking}
              onClick={(event) => {
                event.preventDefault();
                if (pendingBlock) setDisabled(pendingBlock, true);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBlocking ? t("blocking") : t("blockConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
