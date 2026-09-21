"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useKeyInfo } from "@/app/(dashboard)/hooks/keys/useKeyInfo";
import { keyKeys, useKeys } from "@/app/(dashboard)/hooks/keys/useKeys";
import { useOrganizations } from "@/app/(dashboard)/hooks/organizations/useOrganizations";
import { useAllTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  usePersistedColumnVisibility,
  useUrlTableState,
  type UrlTableStateOptions,
} from "@/components/shared/DataTable";
import { KeyResponse, Team } from "@/components/key_team_helpers/key_list";
import CreateKey, { CreateKeyPrefillData } from "@/components/organisms/create_key_button";
import KeyInfoView from "@/components/templates/key_info_view";
import { DEBOUNCE_WAIT_MS } from "@/utils/debounceConstants";
import { formatNumberWithCommas } from "@/utils/dataUtils";
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/localStorageUtils";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@tanstack/react-pacer/debouncer";
import { ColumnFiltersState, functionalUpdate, OnChangeFn } from "@tanstack/react-table";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Filter,
  KeyRound,
  Loader2,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Sun,
  X,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FocusSelectedKeyState, FocusVisibilityMenu } from "./FocusVisibilityMenu";

const FILTER_COLUMNS = ["team_id", "org_id", "user_id", "key_hash", "status"] as const;
const KEY_STATUS_VALUES = ["active", "expired", "revoked", "deleted"] as const;
const SORT_FIELDS = ["key_alias", "token", "created_at", "updated_at", "spend", "max_budget"] as const;
const FOCUS_THEME_STORAGE_KEY = "litellm_focus_virtual_keys_theme";

type FilterColumn = (typeof FILTER_COLUMNS)[number];
type KeyStatus = (typeof KEY_STATUS_VALUES)[number];
type FocusTheme = "light" | "dark";

const TABLE_STATE_OPTIONS: UrlTableStateOptions<FilterColumn> = {
  sortFields: SORT_FIELDS,
  defaultSort: { id: "created_at", desc: true },
  defaultPageSize: 50,
  maxPageSize: 100,
  filterColumns: FILTER_COLUMNS,
  urlKeys: {
    search: "key_search",
    filter_team_id: "filter_team",
    filter_org_id: "filter_org",
    filter_user_id: "filter_user",
    filter_key_hash: "filter_key_id",
  },
};

export const FOCUS_FIELDS = [
  "identity",
  "team",
  "user",
  "createdAt",
  "lastActivity",
  "spendBudget",
  "totalSpend",
  "budgetReset",
  "models",
] as const;

export type FocusField = (typeof FOCUS_FIELDS)[number];

const DEFAULT_VISIBILITY: Record<FocusField, boolean> = {
  identity: true,
  team: true,
  user: true,
  createdAt: true,
  lastActivity: true,
  spendBudget: true,
  totalSpend: true,
  budgetReset: true,
  models: true,
};

const isStatus = (value: unknown): value is KeyStatus => (KEY_STATUS_VALUES as readonly unknown[]).includes(value);

const filterValue = (filters: ColumnFiltersState, id: FilterColumn): string | undefined => {
  const value = filters.find((filter) => filter.id === id)?.value;
  return typeof value === "string" ? value : undefined;
};

const normalizeFilters = (filters: ColumnFiltersState) =>
  filters.filter((filter) => filter.id !== "status" || isStatus(filter.value));

const isDate = (value: string | null | undefined): boolean => Boolean(value && !Number.isNaN(Date.parse(value)));

const formatDate = (value: string | null | undefined, locale: string, fallback: string): string =>
  isDate(value) ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value as string)) : fallback;

const formatMoney = (value: number | null | undefined): string => `$${formatNumberWithCommas(value, 2)}`;

const draftFromFilters = (filters: ColumnFiltersState): Record<FilterColumn, string> =>
  Object.fromEntries(FILTER_COLUMNS.map((id) => [id, filterValue(filters, id) ?? ""])) as Record<FilterColumn, string>;

const filterLabel = (
  filter: ColumnFiltersState[number],
  teams: Team[],
  organizations: Array<{ organization_id?: string | null; organization_alias?: string | null }>,
  t: (key: string) => string,
): string => {
  const value = String(filter.value);
  if (filter.id === "team_id") return teams.find((team) => team.team_id === value)?.team_alias || value;
  if (filter.id === "org_id")
    return organizations.find((organization) => organization.organization_id === value)?.organization_alias || value;
  if (filter.id === "status" && isStatus(value)) return t(`focusKeys.status.${value}`);
  return value;
};

function getInitialTheme(): FocusTheme {
  return getLocalStorageItem(FOCUS_THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function getKeyStatus(key: KeyResponse): KeyStatus {
  if (key.deleted_at) return "deleted";
  if (key.blocked) return "revoked";
  if (isDate(key.expires) && Date.parse(key.expires) < Date.now()) return "expired";
  return "active";
}

function KeyRow({
  keyData,
  selected,
  locale,
  visible,
  onSelect,
}: {
  keyData: KeyResponse;
  selected: boolean;
  locale: string;
  visible: Record<FocusField, boolean>;
  onSelect: () => void;
}) {
  const { t } = useTranslation("gateway");
  const status = getKeyStatus(keyData);
  const owner =
    keyData.user?.user_alias ||
    keyData.user?.user_email ||
    keyData.user_email ||
    keyData.user_id ||
    t("focusKeys.unknown");
  const fields: Array<[FocusField, string, string]> = [
    ["team", t("focusKeys.fields.team"), keyData.team_alias || keyData.team_id || t("focusKeys.unassigned")],
    ["user", t("focusKeys.fields.user"), owner],
    ["createdAt", t("focusKeys.fields.createdAt"), formatDate(keyData.created_at, locale, t("focusKeys.unknown"))],
    ["lastActivity", t("focusKeys.fields.lastActivity"), formatDate(keyData.last_active, locale, t("focusKeys.never"))],
    [
      "spendBudget",
      t("focusKeys.fields.spendBudget"),
      `${formatMoney(keyData.spend)} / ${keyData.max_budget == null ? t("focusKeys.unlimited") : formatMoney(keyData.max_budget)}`,
    ],
    ["totalSpend", t("focusKeys.fields.totalSpend"), formatMoney(keyData.total_spend)],
    [
      "budgetReset",
      t("focusKeys.fields.budgetReset"),
      formatDate(keyData.budget_reset_at, locale, t("focusKeys.never")),
    ],
    [
      "models",
      t("focusKeys.fields.models"),
      keyData.models?.length ? keyData.models.join(", ") : t("focusKeys.noModels"),
    ],
  ];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`focus-key-row w-full rounded-xl border p-4 text-left transition ${selected ? "focus-key-row-selected" : ""}`}
      aria-current={selected ? "true" : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="focus-key-glyph grid size-9 shrink-0 place-items-center rounded-lg">
          <KeyRound className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {keyData.key_alias || keyData.key_name || keyData.token}
              </p>
              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{keyData.token}</p>
            </div>
            <span className={`focus-status focus-status-${status}`}>{t(`focusKeys.status.${status}`)}</span>
          </div>
          <dl className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2">
            {fields
              .filter(([field]) => visible[field])
              .map(([field, label, value]) => (
                <div key={field} className="min-w-0">
                  <dt className="text-[11px] text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 truncate text-sm text-foreground" title={value}>
                    {value}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
    </button>
  );
}

function FocusVirtualKeysPage() {
  const { t, i18n } = useTranslation("gateway");
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const { isViewOnly } = useAuthorized();
  const queryClient = useQueryClient();
  const [selectedKeyId, setSelectedKeyId] = useQueryState("key", parseAsString.withOptions({ history: "push" }));
  const [theme, setTheme] = useState<FocusTheme>(getInitialTheme);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<Record<FilterColumn, string>>(() => draftFromFilters([]));
  const [createdKeys, setCreatedKeys] = useState<KeyResponse[]>([]);
  const { data: teamsData } = useAllTeams();
  const { data: organizationsData } = useOrganizations();
  const teams = useMemo<Team[]>(() => teamsData ?? [], [teamsData]);
  const organizations = useMemo(() => organizationsData ?? [], [organizationsData]);
  const {
    search: searchInput,
    setSearch,
    sorting,
    onSortingChange,
    pagination,
    onPaginationChange,
    columnFilters: rawColumnFilters,
    onColumnFiltersChange: setColumnFilters,
  } = useUrlTableState(TABLE_STATE_OPTIONS);
  const columnFilters = useMemo(() => normalizeFilters(rawColumnFilters), [rawColumnFilters]);
  const onColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => setColumnFilters(functionalUpdate(updater, columnFilters)),
    [columnFilters, setColumnFilters],
  );
  const [searchQuery] = useDebouncedValue(searchInput, { wait: DEBOUNCE_WAIT_MS });
  const sort = sorting[0] ?? { id: "created_at", desc: true };
  const keyListOptions = {
    teamID: filterValue(columnFilters, "team_id"),
    organizationID: filterValue(columnFilters, "org_id"),
    userID: filterValue(columnFilters, "user_id"),
    keyHash: filterValue(columnFilters, "key_hash"),
    status: filterValue(columnFilters, "status"),
    search: searchQuery.trim() || undefined,
    sortBy: sort.id,
    sortOrder: sort.desc ? "desc" : "asc",
    expand: "user",
  };
  const {
    data: keys,
    isPending,
    isPlaceholderData,
    isFetching,
    isError,
    refetch,
  } = useKeys(pagination.pageIndex + 1, pagination.pageSize, keyListOptions);
  const keyList = useMemo(() => keys?.keys ?? [], [keys]);
  const selectedKeyFromList = useMemo(
    () => keyList.find((key) => key.token === selectedKeyId),
    [keyList, selectedKeyId],
  );
  const {
    data: fetchedSelectedKey,
    isError: selectedKeyLoadFailed,
    refetch: refetchSelected,
  } = useKeyInfo(selectedKeyId, {
    enabled: !selectedKeyFromList,
  });
  const selectedKey = selectedKeyFromList ?? fetchedSelectedKey;
  const { columnVisibility, onColumnVisibilityChange } = usePersistedColumnVisibility(
    "focus-virtual-keys",
    DEFAULT_VISIBILITY,
  );
  const visibility = useMemo(
    () => ({ ...DEFAULT_VISIBILITY, ...columnVisibility }) as Record<FocusField, boolean>,
    [columnVisibility],
  );

  useEffect(() => {
    const previousTheme = document.documentElement.getAttribute("data-focus-theme");
    const hadDarkClass = document.documentElement.classList.contains("dark");
    document.documentElement.setAttribute("data-focus-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    setLocalStorageItem(FOCUS_THEME_STORAGE_KEY, theme);
    return () => {
      if (previousTheme === null) document.documentElement.removeAttribute("data-focus-theme");
      else document.documentElement.setAttribute("data-focus-theme", previousTheme);
      document.documentElement.classList.toggle("dark", hadDarkClass);
    };
  }, [theme]);

  const prefillData = useMemo<CreateKeyPrefillData | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") !== "true") return undefined;
    const models = params
      .get("models")
      ?.split(",")
      .slice(0, 100)
      .map((model) => model.trim().slice(0, 256))
      .filter(Boolean);
    const ownedBy = params.get("owned_by");
    const keyType = params.get("key_type");
    return {
      owned_by: ownedBy === "you" || ownedBy === "service_account" || ownedBy === "another_user" ? ownedBy : undefined,
      team_id: params.get("team_id")?.trim() || undefined,
      key_alias: params.get("key_alias")?.trim().slice(0, 256) || undefined,
      models: models?.length ? models : undefined,
      key_type: keyType === "default" || keyType === "llm_api" || keyType === "management" ? keyType : undefined,
    };
  }, []);

  const openFilters = () => {
    setDraftFilters(draftFromFilters(columnFilters));
    setFiltersOpen(true);
  };
  const applyDraftFilters = () => {
    onColumnFiltersChange(
      FILTER_COLUMNS.flatMap((id) => {
        const value = draftFilters[id].trim();
        return value ? [{ id, value }] : [];
      }),
    );
    setFiltersOpen(false);
  };
  const clearAllFilters = () => onColumnFiltersChange([]);
  const removeFilter = (id: FilterColumn) => onColumnFiltersChange(columnFilters.filter((filter) => filter.id !== id));
  const refresh = async () => {
    await Promise.all([
      refetch(),
      selectedKeyId ? queryClient.invalidateQueries({ queryKey: keyKeys.detail(selectedKeyId) }) : Promise.resolve(),
      selectedKeyId && !selectedKeyFromList ? refetchSelected() : Promise.resolve(),
    ]);
  };
  const updateSelectedKey = (updated: Partial<KeyResponse>) => {
    const rotatedToken = updated.token ?? updated.token_id;
    if (rotatedToken && rotatedToken !== selectedKeyId) void setSelectedKeyId(rotatedToken, { history: "replace" });
    void refresh();
  };
  const activeFilters = columnFilters.map((filter) => ({
    id: filter.id as FilterColumn,
    label: filterLabel(filter, teams, organizations, t),
  }));
  const sortLabels: Record<(typeof SORT_FIELDS)[number], string> = {
    key_alias: t("focusKeys.sort.keyAlias"),
    token: t("focusKeys.sort.keyId"),
    created_at: t("focusKeys.sort.createdAt"),
    updated_at: t("focusKeys.sort.updatedAt"),
    spend: t("focusKeys.sort.spend"),
    max_budget: t("focusKeys.sort.budget"),
  };
  const pageCount = keys?.total_pages ?? 1;
  const filterLabels: Record<FilterColumn, string> = {
    team_id: t("focusKeys.filters.team"),
    org_id: t("focusKeys.filters.organization"),
    user_id: t("focusKeys.filters.user"),
    key_hash: t("focusKeys.filters.keyHash"),
    status: t("focusKeys.filters.status"),
  };
  const addCreatedKey = (key: KeyResponse) => {
    setCreatedKeys((previous) => [...previous, key]);
    void setSelectedKeyId(key.token);
    void refetch();
  };

  return (
    <div className="focus-ui min-h-screen bg-background text-foreground" data-focus-theme={theme}>
      <style jsx global>{`
        html[data-focus-theme="dark"] {
          color-scheme: dark;
          --background: oklch(0.16 0.02 285);
          --foreground: oklch(0.96 0.01 285);
          --card: oklch(0.21 0.025 285);
          --popover: oklch(0.21 0.025 285);
          --muted: oklch(0.27 0.02 285);
          --muted-foreground: oklch(0.73 0.02 285);
          --border: oklch(0.31 0.025 285);
          --primary: oklch(0.76 0.13 295);
          --primary-foreground: oklch(0.2 0.02 285);
        }
        html[data-focus-theme="light"] {
          color-scheme: light;
          --background: oklch(0.975 0.008 285);
          --foreground: oklch(0.22 0.025 285);
          --card: oklch(1 0 0);
          --popover: oklch(1 0 0);
          --muted: oklch(0.95 0.015 285);
          --muted-foreground: oklch(0.49 0.02 285);
          --border: oklch(0.9 0.02 285);
          --primary: oklch(0.53 0.16 295);
          --primary-foreground: oklch(1 0 0);
        }
        .focus-ui {
          --focus-violet: oklch(0.53 0.16 295);
          --focus-violet-soft: color-mix(in oklab, var(--focus-violet) 13%, transparent);
        }
        .focus-key-row {
          border-color: transparent;
          background: transparent;
        }
        .focus-key-row:hover,
        .focus-key-row-selected {
          background: var(--focus-violet-soft);
          border-color: color-mix(in oklab, var(--focus-violet) 32%, var(--border));
        }
        .focus-key-glyph {
          background: var(--focus-violet-soft);
          color: var(--focus-violet);
        }
        .focus-status {
          border-radius: 9999px;
          padding: 0.2rem 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .focus-status-active {
          background: color-mix(in oklab, #63b652 18%, transparent);
          color: #438336;
        }
        .focus-status-expired {
          background: color-mix(in oklab, #dc8c25 18%, transparent);
          color: #a55c0d;
        }
        .focus-status-revoked,
        .focus-status-deleted {
          background: color-mix(in oklab, #d65761 16%, transparent);
          color: #b53e4d;
        }
      `}</style>
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="fixed left-4 top-4 z-raised"
              aria-label={t("focusKeys.title")}
            />
          }
        >
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-4" showCloseButton>
          <SheetTitle>{t("focusKeys.title")}</SheetTitle>
          <nav className="mt-4" aria-label={t("focusKeys.title")}>
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary" aria-current="page">
              {t("focusKeys.title")}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <div
        className={`mx-auto grid min-h-screen max-w-[1600px] ${
          selectedKeyId ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : "lg:grid-cols-1"
        }`}
      >
        <section className={`min-w-0 border-r border-border ${selectedKeyId ? "hidden lg:block" : "block"}`}>
          <div className="border-b border-border px-5 py-5 pl-16 sm:px-6 sm:py-6 sm:pl-16">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("focusKeys.title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("focusKeys.subtitle")}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden lg:block">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                    aria-label={theme === "dark" ? t("focusKeys.theme.light") : t("focusKeys.theme.dark")}
                  >
                    {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  </Button>
                </div>
                {!isViewOnly && (
                  <CreateKey
                    team={null}
                    teams={teams}
                    data={createdKeys}
                    addKey={addCreatedKey}
                    autoOpenCreate={
                      typeof window !== "undefined" &&
                      new URLSearchParams(window.location.search).get("create") === "true"
                    }
                    prefillData={prefillData}
                  />
                )}
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                  placeholder={t("focusKeys.searchPlaceholder")}
                  aria-label={t("focusKeys.searchPlaceholder")}
                />
              </div>
              <Button variant="outline" size="icon" onClick={openFilters} aria-label={t("focusKeys.filters.open")}>
                <Filter className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => void refresh()}
                disabled={isFetching}
                aria-label={t("focusKeys.refresh")}
              >
                <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
            {activeFilters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map(({ id, label }) => (
                  <Button
                    key={id}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => removeFilter(id)}
                    className="gap-1"
                  >
                    {filterLabels[id]}: {label}
                    <X className="size-3" />
                  </Button>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={clearAllFilters}>
                  {t("focusKeys.filters.clearAll")}
                </Button>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Select
                value={sort.id}
                onValueChange={(id) => {
                  if (id) onSortingChange([{ id, desc: sort.desc }]);
                }}
              >
                <SelectTrigger size="sm" aria-label={t("focusKeys.sort.label")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_FIELDS.map((field) => (
                    <SelectItem key={field} value={field}>
                      {sortLabels[field]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => onSortingChange([{ id: sort.id, desc: !sort.desc }])}>
                {sort.desc ? t("focusKeys.sort.desc") : t("focusKeys.sort.asc")}
              </Button>
              <FocusVisibilityMenu visibility={visibility} onChange={onColumnVisibilityChange} />
            </div>
          </div>
          <div className="space-y-2 p-3 sm:p-4">
            {(isPending || isPlaceholderData) && (
              <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("focusKeys.loading")}
              </div>
            )}
            {isError && (
              <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-destructive">
                <CircleAlert className="size-4" />
                {t("focusKeys.error")}
              </div>
            )}
            {!isPending && !isPlaceholderData && !isError && keyList.length === 0 && (
              <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                {t("focusKeys.empty")}
              </div>
            )}
            {keyList.map((keyData) => (
              <KeyRow
                key={keyData.token}
                keyData={keyData}
                selected={keyData.token === selectedKeyId}
                locale={locale}
                visible={visibility}
                onSelect={() => void setSelectedKeyId(keyData.token)}
              />
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground">
            <span>{t("focusKeys.pagination.total", { count: keys?.total_count ?? 0 })}</span>
            <div className="flex items-center gap-2">
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => onPaginationChange({ pageIndex: 0, pageSize: Number(value) })}
              >
                <SelectTrigger size="sm" aria-label={t("focusKeys.pagination.pageSize")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[25, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={pagination.pageIndex === 0}
                onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
                aria-label={t("focusKeys.pagination.previous")}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="tabular-nums">
                {pagination.pageIndex + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={pagination.pageIndex + 1 >= pageCount}
                onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
                aria-label={t("focusKeys.pagination.next")}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        {selectedKeyId && (
          <section className="min-w-0">
          {selectedKeyId && !selectedKey && !selectedKeyLoadFailed && (
            <FocusSelectedKeyState onBack={() => void setSelectedKeyId(null)}>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t("focusKeys.loadingKey")}
            </FocusSelectedKeyState>
          )}
          {selectedKeyId && selectedKeyLoadFailed && (
            <FocusSelectedKeyState error onBack={() => void setSelectedKeyId(null)}>
              {t("focusKeys.keyNotFound")}
            </FocusSelectedKeyState>
          )}
          {selectedKey && (
            <div className="min-h-screen overflow-auto p-3 sm:p-5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-3 ml-12 lg:ml-0"
                  onClick={() => void setSelectedKeyId(null)}
                >
                <ArrowLeft className="size-4" />
                {t("focusKeys.back")}
              </Button>
              <KeyInfoView
                key={selectedKeyId ?? selectedKey.token}
                keyId={selectedKeyId ?? selectedKey.token}
                keyData={selectedKey}
                teams={teams}
                onClose={() => void setSelectedKeyId(null)}
                onDelete={() => void refresh()}
                onKeyDataUpdate={updateSelectedKey}
                backButtonText={t("focusKeys.back")}
              />
            </div>
          )}
          </section>
        )}
      </div>
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("focusKeys.filters.title")}</DialogTitle>
            <DialogDescription>{t("focusKeys.filters.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <FilterSelect
              label={filterLabels.team_id}
              value={draftFilters.team_id}
              options={teams.map((team) => ({ value: team.team_id, label: team.team_alias || team.team_id }))}
              onChange={(value) => setDraftFilters((filters) => ({ ...filters, team_id: value }))}
              emptyLabel={t("focusKeys.filters.all")}
            />
            <FilterSelect
              label={filterLabels.org_id}
              value={draftFilters.org_id}
              options={organizations
                .filter((organization) => organization.organization_id)
                .map((organization) => ({
                  value: organization.organization_id as string,
                  label: organization.organization_alias || (organization.organization_id as string),
                }))}
              onChange={(value) => setDraftFilters((filters) => ({ ...filters, org_id: value }))}
              emptyLabel={t("focusKeys.filters.all")}
            />
            <label className="grid gap-2 text-sm font-medium">
              {filterLabels.user_id}
              <Input
                value={draftFilters.user_id}
                onChange={(event) => setDraftFilters((filters) => ({ ...filters, user_id: event.target.value }))}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {filterLabels.key_hash}
              <Input
                value={draftFilters.key_hash}
                onChange={(event) => setDraftFilters((filters) => ({ ...filters, key_hash: event.target.value }))}
              />
            </label>
            <FilterSelect
              label={filterLabels.status}
              value={draftFilters.status}
              options={KEY_STATUS_VALUES.map((status) => ({ value: status, label: t(`focusKeys.status.${status}`) }))}
              onChange={(value) => setDraftFilters((filters) => ({ ...filters, status: value }))}
              emptyLabel={t("focusKeys.filters.all")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraftFilters(draftFromFilters([]))}>
              {t("focusKeys.filters.reset")}
            </Button>
            <Button variant="outline" onClick={() => setFiltersOpen(false)}>
              {t("focusKeys.filters.cancel")}
            </Button>
            <Button onClick={applyDraftFilters}>{t("focusKeys.filters.apply")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-raised lg:hidden"
        onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        aria-label={theme === "dark" ? t("focusKeys.theme.light") : t("focusKeys.theme.dark")}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  emptyLabel,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  emptyLabel: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Select value={value || "all"} onValueChange={(next) => onChange(next === "all" || next === null ? "" : next)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{emptyLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export default FocusVirtualKeysPage;
