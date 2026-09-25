"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import { useUISettings } from "@/app/(dashboard)/hooks/uiSettings/useUISettings";
import {
  FOCUS_MODEL_SECTION_GROUPS,
  getVisibleModelSections,
  renderModelSection,
  type FocusModelSectionGroup,
  type ModelSection,
  type ModelSectionContext,
  type ModelSectionId,
} from "@/features/models-and-endpoints/modelSections";
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/localStorageUtils";
import { uiHref } from "@/utils/uiHref";
import { KeyRound, Menu, Network } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FocusAppearanceControls } from "./FocusAppearanceControls";

type FocusTheme = "light" | "dark";

const FOCUS_THEME_STORAGE_KEY = "litellm_focus_virtual_keys_theme";
function getInitialTheme(): FocusTheme {
  return getLocalStorageItem(FOCUS_THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export default function FocusModelsAndEndpointsPage() {
  const { t } = useTranslation("gateway");
  const { userRole, userId: userID, isViewOnly } = useAuthorized();
  const { data: teams } = useTeams();
  const { data: uiSettings } = useUISettings();
  const [theme, setTheme] = useState<FocusTheme>(getInitialTheme);
  const [activeGroup, setActiveGroup] = useState<FocusModelSectionGroup>("models");

  const sectionContext = useMemo<ModelSectionContext>(
    () => ({
      userRole,
      userID,
      isViewOnly,
      teams: teams ?? null,
      disableModelAddForInternalUsers: uiSettings?.values?.disable_model_add_for_internal_users === true,
    }),
    [isViewOnly, teams, uiSettings?.values?.disable_model_add_for_internal_users, userID, userRole],
  );
  const visibleSections = useMemo(() => getVisibleModelSections(sectionContext), [sectionContext]);
  const visibleGroups = useMemo(
    () =>
      FOCUS_MODEL_SECTION_GROUPS.filter((group) =>
        visibleSections.some((section) => section.focus.group === group.id),
      ),
    [visibleSections],
  );
  const selectedGroup = visibleGroups.find((group) => group.id === activeGroup) ?? visibleGroups[0];

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
        .focus-model-row {
          border-color: transparent;
          background: transparent;
        }
        .focus-model-row:hover,
        .focus-model-row-selected {
          background: var(--focus-violet-soft);
          border-color: color-mix(in oklab, var(--focus-violet) 32%, var(--border));
        }
        .focus-model-glyph {
          background: var(--focus-violet-soft);
          color: var(--focus-violet);
        }
      `}</style>
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="fixed left-4 top-4 z-raised"
              aria-label={t("focusModelsAndEndpoints.title")}
            />
          }
        >
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-4" showCloseButton>
          <SheetTitle>{t("focusModelsAndEndpoints.title")}</SheetTitle>
          <nav className="mt-4" aria-label={t("focusModelsAndEndpoints.title")}>
            <Link
              href={uiHref("new-ui")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <KeyRound className="size-4" /> {t("focusKeys.title")}
            </Link>
            <div
              className="mt-1 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
              aria-current="page"
            >
              <Network className="size-4" /> {t("focusModelsAndEndpoints.title")}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <main className="mx-auto min-h-screen max-w-[1600px] min-w-0 overflow-x-clip px-5 py-5 pl-16 sm:px-6 sm:py-6 sm:pl-16">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("focusModelsAndEndpoints.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("focusModelsAndEndpoints.subtitle")}</p>
          </div>
          <FocusAppearanceControls
            theme={theme}
            lightThemeLabel={t("focusModelsAndEndpoints.theme.light")}
            darkThemeLabel={t("focusModelsAndEndpoints.theme.dark")}
            onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          />
        </header>
        <Tabs
          value={selectedGroup?.id}
          onValueChange={(group) => {
            if (visibleGroups.some((candidate) => candidate.id === group)) {
              setActiveGroup(group as FocusModelSectionGroup);
            }
          }}
          className="mt-5 gap-5"
        >
          <div className="min-w-0 border-b border-border">
            <TabsList
              variant="line"
              className="h-auto max-w-full flex-wrap justify-start"
              aria-label={t("focusModelsAndEndpoints.tabs.label")}
            >
              {visibleGroups.map((group) => (
                <TabsTrigger key={group.id} value={group.id} className="flex-none px-3">
                  {t(`focusModelsAndEndpoints.tabs.${group.id}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {visibleGroups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="min-h-80">
              <InnerTabs
                group={group.id}
                sections={visibleSections
                  .filter((section) => section.focus.group === group.id)
                  .sort((left, right) => left.focus.order - right.focus.order)}
                t={t}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}

function InnerTabs({
  group,
  sections,
  t,
}: {
  group: FocusModelSectionGroup;
  sections: readonly ModelSection[];
  t: (key: string) => string;
}) {
  const [activeSection, setActiveSection] = useState<ModelSectionId>(sections[0]?.id ?? "all-models");
  const selectedSection = sections.find((section) => section.id === activeSection) ?? sections[0];

  if (selectedSection == null) {
    return null;
  }

  return (
    <Tabs
      value={selectedSection.id}
      onValueChange={(sectionId) => {
        if (sections.some((section) => section.id === sectionId)) {
          setActiveSection(sectionId as ModelSectionId);
        }
      }}
      className="gap-5"
    >
      <div className="min-w-0">
        <TabsList
          variant="default"
          className="h-auto max-w-full flex-wrap justify-start"
          aria-label={t(`focusModelsAndEndpoints.tabs.${group}`)}
        >
          {sections.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="flex-none">
              {t(section.translationKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {sections.map((section) => (
        <TabsContent key={section.id} value={section.id} className="min-h-64">
          {renderModelSection(section, "focus")}
        </TabsContent>
      ))}
    </Tabs>
  );
}
