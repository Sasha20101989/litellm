"use client";

import { ColumnFiltersState, OnChangeFn, PaginationState } from "@tanstack/react-table";
import { ScrollText } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DataTable,
  DataTableFilterDrawer,
  DataTableFilterField,
  DataTableToolbar,
} from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { AuditLogEntry, getAuditLogsTableColumns, getAuditTableNameDisplay } from "./AuditLogsTableColumns";

interface AuditLogsTableProps {
  data: AuditLogEntry[];
  rowCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  onRefresh: () => void;
  onViewLog: (log: AuditLogEntry) => void;
}

const ALL_VALUE = "all";

const ACTION_OPTIONS = [
  { label: "Created", value: "created" },
  { label: "Updated", value: "updated" },
  { label: "Deleted", value: "deleted" },
  { label: "Rotated", value: "rotated" },
] as const;

const TABLE_OPTIONS = [
  { label: "Keys", value: "LiteLLM_VerificationToken" },
  { label: "Teams", value: "LiteLLM_TeamTable" },
  { label: "Users", value: "LiteLLM_UserTable" },
  { label: "Organizations", value: "LiteLLM_OrganizationTable" },
  { label: "Models", value: "LiteLLM_ProxyModelTable" },
] as const;

function AuditLogsEmptyState({ filtered }: { filtered: boolean }) {
  const { t } = useTranslation("logs");
  return (
    <div className="flex flex-col items-center gap-1 py-6">
      <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-muted">
        <ScrollText className="size-5 text-muted-foreground" />
      </div>
      <div className="text-sm font-medium text-foreground">
        {filtered ? t("audit.noMatchesTitle") : t("audit.emptyTitle")}
      </div>
      <div className="max-w-xs text-center text-sm text-muted-foreground">
        {filtered ? t("audit.noMatchesDescription") : t("audit.emptyDescription")}
      </div>
    </div>
  );
}

export function AuditLogsTable({
  data,
  rowCount,
  isLoading,
  isRefreshing,
  pagination,
  onPaginationChange,
  columnFilters,
  onColumnFiltersChange,
  onRefresh,
  onViewLog,
}: AuditLogsTableProps) {
  const { t } = useTranslation("logs");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const columns = useMemo(() => getAuditLogsTableColumns({ onViewLog }, t), [onViewLog, t]);
  const actionOptions = ACTION_OPTIONS.map((option) => ({
    ...option,
    label: t(`audit.actions.${option.value}`),
  }));
  const tableOptions = TABLE_OPTIONS.map((option) => ({
    ...option,
    label: getAuditTableNameDisplay(t)[option.value],
  }));
  const filterLabels: Record<string, string> = {
    object_id: t("audit.objectId"),
    changed_by: t("audit.changedBy"),
    team_id: t("filters.teamId"),
    key_hash: t("filters.keyHash"),
    action: t("audit.action"),
    table_name: t("audit.table"),
  };
  const formatFilterValue = (columnId: string, value: unknown): string => {
    const raw = String(value);
    if (columnId === "action") return actionOptions.find((option) => option.value === raw)?.label ?? raw;
    if (columnId === "table_name") return getAuditTableNameDisplay(t)[raw] ?? raw;
    return raw;
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(row) => row.id}
      paginationMode="server"
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      rowCount={rowCount}
      filterMode="server"
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      isLoading={isLoading}
      loadingMessage={t("audit.loading")}
      noDataMessage={<AuditLogsEmptyState filtered={columnFilters.length > 0} />}
      size="compact"
      toolbar={(table) => (
        <>
          <DataTableToolbar
            table={table}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            onOpenFilters={() => setFiltersOpen(true)}
            filterLabels={filterLabels}
            formatFilterValue={formatFilterValue}
            showViewOptions={false}
          />
          <DataTableFilterDrawer
            table={table}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            title={t("request.filtersTitle")}
            description={t("audit.filtersDescription")}
          >
            {({ get, set }) => (
              <>
                <DataTableFilterField label={t("audit.objectId")}>
                  <Input
                    value={(get("object_id") as string) ?? ""}
                    onChange={(event) => set("object_id", event.target.value)}
                    placeholder={t("audit.enterObjectId")}
                  />
                </DataTableFilterField>
                <DataTableFilterField label={t("audit.changedBy")}>
                  <Input
                    value={(get("changed_by") as string) ?? ""}
                    onChange={(event) => set("changed_by", event.target.value)}
                    placeholder={t("audit.enterUserId")}
                  />
                </DataTableFilterField>
                <DataTableFilterField label={t("filters.teamId")}>
                  <Input
                    value={(get("team_id") as string) ?? ""}
                    onChange={(event) => set("team_id", event.target.value)}
                    placeholder={t("audit.enterTeamId")}
                  />
                </DataTableFilterField>
                <DataTableFilterField label={t("filters.keyHash")}>
                  <Input
                    value={(get("key_hash") as string) ?? ""}
                    onChange={(event) => set("key_hash", event.target.value)}
                    placeholder={t("audit.enterKeyHash")}
                  />
                </DataTableFilterField>
                <DataTableFilterField label={t("audit.action")}>
                  <Select
                    value={(get("action") as string) ?? ALL_VALUE}
                    onValueChange={(value) => set("action", value === ALL_VALUE ? undefined : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("audit.allActions")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>{t("audit.allActions")}</SelectItem>
                      {actionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DataTableFilterField>
                <DataTableFilterField label={t("audit.table")}>
                  <Select
                    value={(get("table_name") as string) ?? ALL_VALUE}
                    onValueChange={(value) => set("table_name", value === ALL_VALUE ? undefined : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("audit.allTables")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>{t("audit.allTables")}</SelectItem>
                      {tableOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DataTableFilterField>
              </>
            )}
          </DataTableFilterDrawer>
        </>
      )}
    />
  );
}
