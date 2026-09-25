"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/localStorageUtils";
import { uiHref } from "@/utils/uiHref";
import { KeyRound, Menu, Network } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FocusAddModelPanel } from "./FocusAddModelPanel";
import { FocusAppearanceControls } from "./FocusAppearanceControls";
import { FocusModelsList } from "./FocusModelsList";

type FocusTheme = "light" | "dark";

const FOCUS_THEME_STORAGE_KEY = "litellm_focus_virtual_keys_theme";
const TABS = ["models", "endpoints", "routing", "accessAndCost"] as const;

const INNER_TABS = {
  models: ["allModels", "addModel", "llmCredentials", "healthStatus"],
  endpoints: ["passThroughEndpoints"],
  routing: ["autoRouters", "modelRetrySettings", "modelGroupAlias"],
  accessAndCost: ["modelAccessGroupBudgets", "priceDataReload"],
} as const;

type FocusModelsTab = (typeof TABS)[number];
type FocusModelsInnerTab = (typeof INNER_TABS)[FocusModelsTab][number];

function getInitialTheme(): FocusTheme {
  return getLocalStorageItem(FOCUS_THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export default function FocusModelsAndEndpointsPage() {
  const { t } = useTranslation("gateway");
  const [theme, setTheme] = useState<FocusTheme>(getInitialTheme);

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
        <Tabs defaultValue="models" className="mt-5 gap-5">
          <div className="min-w-0 border-b border-border">
            <TabsList
              variant="line"
              className="h-auto max-w-full flex-wrap justify-start"
              aria-label={t("focusModelsAndEndpoints.tabs.label")}
            >
              {TABS.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="flex-none px-3">
                  {t(`focusModelsAndEndpoints.tabs.${tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {TABS.map((tab) => (
            <TabsContent key={tab} value={tab} className="min-h-80">
              <InnerTabs section={tab} t={t} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}

function InnerTabs({ section, t }: { section: FocusModelsTab; t: (key: string) => string }) {
  const innerTabs = INNER_TABS[section];

  return (
    <Tabs defaultValue={innerTabs[0]} className="gap-5">
      <div className="min-w-0">
        <TabsList
          variant="default"
          className="h-auto max-w-full flex-wrap justify-start"
          aria-label={t(`focusModelsAndEndpoints.tabs.${section}`)}
        >
          {innerTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="flex-none">
              {t(`focusModelsAndEndpoints.innerTabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {innerTabs.map((tab) => (
        <TabsContent key={tab} value={tab} className="min-h-64">
          {section === "models" && tab === "allModels" ? <FocusModelsList /> : null}
          {section === "models" && tab === "addModel" ? <FocusAddModelPanel /> : null}
        </TabsContent>
      ))}
    </Tabs>
  );
}
