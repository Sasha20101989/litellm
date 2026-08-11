"use client";

import { ColumnFiltersState } from "@tanstack/react-table";
import { Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ToolRow } from "@/components/networking";
import {
  DataTable,
  DataTableFilterDrawer,
  DataTableFilterField,
  DataTableToolbar,
} from "@/components/shared/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { INPUT_POLICY_OPTIONS, OUTPUT_POLICY_OPTIONS } from "./PolicySelect";
import { getToolPoliciesTableColumns } from "./ToolPoliciesTableColumns";

const ALL_VALUE = "all";

const toFilterValue = (value: string | null): string | undefined =>
  value === null || value === ALL_VALUE ? undefined : value;

interface ToolPoliciesTableProps {
  data: ToolRow[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelectTool: (toolName: string) => void;
  savingInput: ReadonlySet<string>;
  savingOutput: ReadonlySet<string>;
  onInputPolicyChange: (toolName: string, policy: string) => void;
  onOutputPolicyChange: (toolName: string, policy: string) => void;
}

function ToolPoliciesEmptyState({ filtered }: { filtered: boolean }) {
  const { t } = useTranslation("management");

  return (
    <div className="flex flex-col items-center gap-1 py-6">
      <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-muted">
        <Wrench className="size-5 text-muted-foreground" />
      </div>
      <div className="text-sm font-medium text-foreground">
        {filtered ? t("toolPolicies.table.noMatching") : t("toolPolicies.table.noTools")}
      </div>
      <div className="max-w-xs text-center text-sm text-muted-foreground">
        {filtered ? t("toolPolicies.table.noMatchingDescription") : t("toolPolicies.table.noToolsDescription")}
      </div>
    </div>
  );
}

function uniqueValues(rows: ToolRow[], pick: (row: ToolRow) => string | undefined): string[] {
  return Array.from(new Set(rows.map(pick).filter((value): value is string => Boolean(value))));
}

export function ToolPoliciesTable({
  data,
  isLoading,
  isRefreshing,
  onRefresh,
  onSelectTool,
  savingInput,
  savingOutput,
  onInputPolicyChange,
  onOutputPolicyChange,
}: ToolPoliciesTableProps) {
  const { t } = useTranslation("management");
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const columns = useMemo(() => {
    const deps = { onSelectTool, savingInput, savingOutput, onInputPolicyChange, onOutputPolicyChange, t };
    return getToolPoliciesTableColumns(deps);
  }, [onSelectTool, savingInput, savingOutput, onInputPolicyChange, onOutputPolicyChange, t]);

  const policyLabels: Record<string, string> = {
    untrusted: t("toolPolicies.policies.untrusted"),
    trusted: t("toolPolicies.policies.trusted"),
    blocked: t("toolPolicies.policies.blocked"),
  };

  const teamOptions = useMemo(() => uniqueValues(data, (row) => row.team_id), [data]);
  const keyAliasOptions = useMemo(() => uniqueValues(data, (row) => row.key_alias), [data]);

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(row) => row.tool_id}
      sortingMode="client"
      defaultSorting={[{ id: "created_at", desc: true }]}
      paginationMode="client"
      pageSizeOptions={[50, 100]}
      filterMode="client"
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      globalFilter={globalFilter}
      onGlobalFilterChange={setGlobalFilter}
      isLoading={isLoading}
      loadingMessage={t("toolPolicies.table.loading")}
      noDataMessage={<ToolPoliciesEmptyState filtered={columnFilters.length > 0 || globalFilter !== ""} />}
      size="compact"
      toolbar={(table) => (
        <>
          <DataTableToolbar
            table={table}
            searchValue={globalFilter}
            onSearchChange={setGlobalFilter}
            searchPlaceholder={t("toolPolicies.table.search")}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            onOpenFilters={() => setFiltersOpen(true)}
            showViewOptions={false}
          />
          <DataTableFilterDrawer
            table={table}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            title={t("toolPolicies.table.filters")}
            description={t("toolPolicies.table.filtersDescription")}
          >
            {({ get, set }) => (
              <>
                <DataTableFilterField label={t("toolPolicies.table.inputPolicy")}>
                  <Select
                    value={(get("input_policy") as string) ?? ALL_VALUE}
                    onValueChange={(value) => set("input_policy", toFilterValue(value))}
                  >
                    <SelectTrigger className="w-full" data-testid="filter-input-policy">
                      <SelectValue placeholder={t("toolPolicies.table.allInput")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>{t("toolPolicies.table.allInput")}</SelectItem>
                      {INPUT_POLICY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {policyLabels[option.value] || option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DataTableFilterField>
                <DataTableFilterField label={t("toolPolicies.table.outputPolicy")}>
                  <Select
                    value={(get("output_policy") as string) ?? ALL_VALUE}
                    onValueChange={(value) => set("output_policy", toFilterValue(value))}
                  >
                    <SelectTrigger className="w-full" data-testid="filter-output-policy">
                      <SelectValue placeholder={t("toolPolicies.table.allOutput")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>{t("toolPolicies.table.allOutput")}</SelectItem>
                      {OUTPUT_POLICY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {policyLabels[option.value] || option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DataTableFilterField>
                <DataTableFilterField label={t("toolPolicies.table.teamName")}>
                  <Select
                    value={(get("team_id") as string) ?? ALL_VALUE}
                    onValueChange={(value) => set("team_id", toFilterValue(value))}
                  >
                    <SelectTrigger className="w-full" data-testid="filter-team">
                      <SelectValue placeholder={t("toolPolicies.table.allTeams")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>{t("toolPolicies.table.allTeams")}</SelectItem>
                      {teamOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DataTableFilterField>
                <DataTableFilterField label={t("toolPolicies.table.keyName")}>
                  <Select
                    value={(get("key_alias") as string) ?? ALL_VALUE}
                    onValueChange={(value) => set("key_alias", toFilterValue(value))}
                  >
                    <SelectTrigger className="w-full" data-testid="filter-key-alias">
                      <SelectValue placeholder={t("toolPolicies.table.allKeys")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>{t("toolPolicies.table.allKeys")}</SelectItem>
                      {keyAliasOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
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
