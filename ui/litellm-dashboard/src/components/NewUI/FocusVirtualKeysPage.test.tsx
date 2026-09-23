import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useKeyInfo } from "@/app/(dashboard)/hooks/keys/useKeyInfo";
import { useKeys } from "@/app/(dashboard)/hooks/keys/useKeys";
import { KeyResponse } from "@/components/key_team_helpers/key_list";
import { renderWithProviders } from "../../../tests/test-utils";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FocusVirtualKeysPage from "./FocusVirtualKeysPage";

const translationState = vi.hoisted(() => ({ language: "ru" as "en" | "ru" }));

vi.mock("react-i18next", async () => {
  const { resources } = await import("@/i18n/catalog");
  return {
    useTranslation: (namespace: "gateway") => ({
      t: (key: string, values?: Record<string, unknown>) => {
        const copy = key.split(".").reduce<unknown>((value, segment) => {
          if (typeof value !== "object" || value === null) return undefined;
          return (value as Record<string, unknown>)[segment];
        }, resources[translationState.language][namespace]);
        if (typeof copy !== "string") return key;
        return Object.entries(values ?? {}).reduce(
          (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
          copy,
        );
      },
      i18n: { language: translationState.language, resolvedLanguage: translationState.language },
    }),
  };
});

vi.mock("@/app/(dashboard)/hooks/useAuthorized", () => ({ default: vi.fn() }));
vi.mock("@/app/(dashboard)/hooks/keys/useKeys", () => ({ useKeys: vi.fn(), keyKeys: { detail: vi.fn() } }));
vi.mock("@/app/(dashboard)/hooks/keys/useKeyInfo", () => ({ useKeyInfo: vi.fn() }));
vi.mock("@/app/(dashboard)/hooks/teams/useTeams", () => ({ useAllTeams: () => ({ data: [] }) }));
vi.mock("@/app/(dashboard)/hooks/organizations/useOrganizations", () => ({ useOrganizations: () => ({ data: [] }) }));
vi.mock("@/components/organisms/create_key_button", () => ({ default: () => null }));
vi.mock("@/components/templates/key_info_view", () => ({ default: () => null }));
vi.mock("./FocusVisibilityMenu", () => ({ FocusSelectedKeyState: ({ children }: { children: React.ReactNode }) => <>{children}</>, FocusVisibilityMenu: () => null }));
vi.mock("@/components/shared/DataTable", () => ({
  usePersistedColumnVisibility: () => ({ columnVisibility: {}, onColumnVisibilityChange: vi.fn() }),
  useUrlTableState: () => ({
    search: "",
    setSearch: vi.fn(),
    sorting: [],
    onSortingChange: vi.fn(),
    pagination: { pageIndex: 0, pageSize: 50 },
    onPaginationChange: vi.fn(),
    columnFilters: [],
    onColumnFiltersChange: vi.fn(),
  }),
}));
vi.mock("@tanstack/react-pacer/debouncer", () => ({ useDebouncedValue: (value: unknown) => [value] }));
vi.mock("nuqs", () => ({ parseAsString: { withOptions: () => ({}) }, useQueryState: () => [null, vi.fn()] }));

const key = (overrides: Partial<KeyResponse>): KeyResponse =>
  ({
    token: "key-token",
    token_id: "key-id",
    key_name: "continue-local",
    key_alias: "continue-local",
    spend: 0,
    total_spend: 0,
    max_budget: 1,
    expires: "",
    models: [],
    aliases: {},
    config: {},
    user_id: "",
    team_id: null,
    project_id: null,
    max_parallel_requests: 0,
    metadata: {},
    tpm_limit: 0,
    rpm_limit: 0,
    duration: "",
    budget_duration: "",
    budget_reset_at: "",
    allowed_cache_controls: [],
    allowed_routes: [],
    key_type: null,
    permissions: {},
    model_spend: {},
    model_max_budget: {},
    soft_budget_cooldown: false,
    blocked: false,
    litellm_budget_table: {},
    organization_id: null,
    created_at: "2026-09-21T00:00:00Z",
    updated_at: "2026-09-21T00:00:00Z",
    last_active: null,
    team_spend: 0,
    team_alias: "",
    team_tpm_limit: 0,
    team_rpm_limit: 0,
    team_max_budget: 0,
    team_models: [],
    team_blocked: false,
    soft_budget: 0,
    team_model_aliases: {},
    team_member_spend: 0,
    team_metadata: {},
    end_user_id: "",
    end_user_tpm_limit: 0,
    end_user_rpm_limit: 0,
    end_user_max_budget: 0,
    last_refreshed_at: 0,
    api_key: "",
    user_role: "user",
    rpm_limit_per_model: {},
    tpm_limit_per_model: {},
    user_tpm_limit: 0,
    user_rpm_limit: 0,
    user_email: "",
    ...overrides,
  }) as KeyResponse;

const renderFocusKey = (overrides: Partial<KeyResponse>) => {
  vi.mocked(useKeys).mockReturnValue({
    data: { keys: [key(overrides)], total_count: 1, total_pages: 1 },
    isPending: false,
    isPlaceholderData: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useKeys>);
  renderWithProviders(<FocusVirtualKeysPage />);
};

describe("FocusVirtualKeysPage budget state", () => {
  beforeEach(() => {
    translationState.language = "ru";
    vi.mocked(useAuthorized).mockReturnValue({ isViewOnly: true } as ReturnType<typeof useAuthorized>);
    vi.mocked(useKeyInfo).mockReturnValue({ data: undefined, isError: false, refetch: vi.fn() } as ReturnType<typeof useKeyInfo>);
  });

  it("shows a warning when a finite key budget reaches 80%", () => {
    renderFocusKey({ spend: 0.8, max_budget: 1 });

    expect(screen.getByText("Бюджет почти исчерпан")).toBeVisible();
  });

  it("shows an exceeded state when a finite key budget reaches 100%", () => {
    renderFocusKey({ spend: 1, max_budget: 1 });

    expect(screen.getByText("Лимит превышен")).toBeVisible();
  });
});
