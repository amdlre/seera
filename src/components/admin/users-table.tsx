"use client";

import { UserSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { setUserDisabledAction, updateUserRoleAction } from "@/actions/admin-users.actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
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

  async function handleDisabledToggle(userId: string, disabled: boolean) {
    const result = await setUserDisabledAction({ userId, disabled });
    if (!result.success) {
      toast.error(tGlobal(result.messageKey));
      return;
    }
    toast.success(disabled ? t("userDisabled") : t("userEnabled"));
    startTransition(refresh);
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
        <div className="border-border overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
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
                const disabled = row.deletedAt !== null;
                return (
                  <TableRow key={row.id}>
                    <TableCell>{row.fullName}</TableCell>
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
                    <TableCell>{row.resumeCount}</TableCell>
                    <TableCell className="text-xs">{row.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={disabled ? "destructive" : "secondary"}>
                        {disabled ? t("statusDisabled") : t("statusActive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisabledToggle(row.id, !disabled)}
                      >
                        {disabled ? t("enable") : t("disable")}
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
    </div>
  );
}
