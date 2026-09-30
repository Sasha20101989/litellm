/* eslint-disable local/filename-pascal-case -- shared feature module name is mandated by the Task 2 contract */
"use client";

import type { ComponentType } from "react";
import { all_admin_roles, internalUserRoles } from "@/utils/roles";
import { autoRouterCreationScope, canCreateModels, type ModelCreationLimits } from "@/utils/modelPermissions";
import AccessGroupBudgetsPanel from "@/app/(dashboard)/models-and-endpoints/panels/AccessGroupBudgetsPanel";
import AddModelPanel from "@/app/(dashboard)/models-and-endpoints/panels/AddModelPanel";
import AllModelsPanel from "@/app/(dashboard)/models-and-endpoints/panels/AllModelsPanel";
import AutoRoutersTabPanel from "@/app/(dashboard)/models-and-endpoints/panels/AutoRoutersTabPanel";
import HealthStatusPanel from "@/app/(dashboard)/models-and-endpoints/panels/HealthStatusPanel";
import LlmCredentialsPanel from "@/app/(dashboard)/models-and-endpoints/panels/LlmCredentialsPanel";
import ModelGroupAliasPanel from "@/app/(dashboard)/models-and-endpoints/panels/ModelGroupAliasPanel";
import ModelRetrySettingsPanel from "@/app/(dashboard)/models-and-endpoints/panels/ModelRetrySettingsPanel";
import PassThroughPanel from "@/app/(dashboard)/models-and-endpoints/panels/PassThroughPanel";
import PriceDataPanel from "@/app/(dashboard)/models-and-endpoints/panels/PriceDataPanel";
import { FocusAddModelPanel } from "@/components/NewUI/FocusAddModelPanel";
import { FocusLlmCredentialsPanel } from "@/components/NewUI/FocusLlmCredentialsPanel";
import { FocusModelsList } from "@/components/NewUI/FocusModelsList";

export const FOCUS_MODEL_SECTION_GROUPS = [
  { id: "models", order: 0 },
  { id: "endpoints", order: 1 },
  { id: "routing", order: 2 },
  { id: "accessAndCost", order: 3 },
] as const;

export type FocusModelSectionGroup = (typeof FOCUS_MODEL_SECTION_GROUPS)[number]["id"];
export type ModelSectionId =
  | "all-models"
  | "add"
  | "auto-routers"
  | "llm-credentials"
  | "pass-through"
  | "health"
  | "retry-settings"
  | "model-group-alias"
  | "access-group-budgets"
  | "price-data";

export interface ModelSectionContext {
  userRole: string | null;
  userID: string | null;
  isViewOnly: boolean;
  teams: ModelCreationLimits["teams"];
  uiSettings: { values?: { disable_model_add_for_internal_users?: boolean } } | null;
}

type ModelSectionRenderer = "default" | "focus";

export interface ModelSection {
  id: ModelSectionId;
  translationKey: string;
  legacyTranslationKey: (context: ModelSectionContext) => string;
  focus: { group: FocusModelSectionGroup; order: number };
  isVisible: (context: ModelSectionContext) => boolean;
  panel: ComponentType;
  focusPanel?: ComponentType;
  showBetaBadge?: boolean;
}

const isInternalUser = (userRole: string | null): boolean =>
  userRole != null && internalUserRoles.includes(userRole);

const modelCreationLimits = (context: ModelSectionContext): ModelCreationLimits => ({
  teams: context.teams,
  disabledForInternalUsers:
    isInternalUser(context.userRole) && context.uiSettings?.values?.disable_model_add_for_internal_users === true,
});

const autoRouterVisibilityLimits = (context: ModelSectionContext): ModelCreationLimits => ({
  teams: context.teams,
  disabledForInternalUsers: false,
});

const isAdmin = ({ userRole }: ModelSectionContext): boolean => all_admin_roles.includes(userRole ?? "");
const isWritableAdmin = (context: ModelSectionContext): boolean => isAdmin(context) && !context.isViewOnly;

export const MODEL_SECTIONS: readonly ModelSection[] = [
  {
    id: "all-models",
    translationKey: "focusModelsAndEndpoints.innerTabs.allModels",
    legacyTranslationKey: (context) => (isAdmin(context) ? "models.tabs.deployed" : "models.tabs.yours"),
    focus: { group: "models", order: 0 },
    isVisible: () => true,
    panel: AllModelsPanel,
    focusPanel: FocusModelsList,
  },
  {
    id: "add",
    translationKey: "focusModelsAndEndpoints.innerTabs.addModel",
    legacyTranslationKey: () => "models.tabs.add",
    focus: { group: "models", order: 1 },
    isVisible: (context) =>
      canCreateModels(
        { userRole: context.userRole, userID: context.userID, isViewOnly: context.isViewOnly },
        modelCreationLimits(context),
      ),
    panel: AddModelPanel,
    focusPanel: FocusAddModelPanel,
  },
  {
    id: "llm-credentials",
    translationKey: "focusModelsAndEndpoints.innerTabs.llmCredentials",
    legacyTranslationKey: () => "models.tabs.credentials",
    focus: { group: "models", order: 2 },
    isVisible: isWritableAdmin,
    panel: LlmCredentialsPanel,
    focusPanel: FocusLlmCredentialsPanel,
  },
  {
    id: "health",
    translationKey: "focusModelsAndEndpoints.innerTabs.healthStatus",
    legacyTranslationKey: () => "models.tabs.health",
    focus: { group: "models", order: 3 },
    isVisible: isAdmin,
    panel: HealthStatusPanel,
  },
  {
    id: "pass-through",
    translationKey: "focusModelsAndEndpoints.innerTabs.passThroughEndpoints",
    legacyTranslationKey: () => "models.tabs.passThrough",
    focus: { group: "endpoints", order: 0 },
    isVisible: isWritableAdmin,
    panel: PassThroughPanel,
  },
  {
    id: "auto-routers",
    translationKey: "focusModelsAndEndpoints.innerTabs.autoRouters",
    legacyTranslationKey: () => "models.tabs.autoRouters",
    focus: { group: "routing", order: 0 },
    isVisible: (context) =>
      isAdmin(context) ||
      autoRouterCreationScope(
        { userRole: context.userRole, userID: context.userID, isViewOnly: context.isViewOnly },
        autoRouterVisibilityLimits(context),
      ) !== "forbidden",
    panel: AutoRoutersTabPanel,
    showBetaBadge: true,
  },
  {
    id: "retry-settings",
    translationKey: "focusModelsAndEndpoints.innerTabs.modelRetrySettings",
    legacyTranslationKey: () => "models.tabs.retry",
    focus: { group: "routing", order: 1 },
    isVisible: isWritableAdmin,
    panel: ModelRetrySettingsPanel,
  },
  {
    id: "model-group-alias",
    translationKey: "focusModelsAndEndpoints.innerTabs.modelGroupAlias",
    legacyTranslationKey: () => "models.tabs.alias",
    focus: { group: "routing", order: 2 },
    isVisible: isWritableAdmin,
    panel: ModelGroupAliasPanel,
  },
  {
    id: "access-group-budgets",
    translationKey: "focusModelsAndEndpoints.innerTabs.modelAccessGroupBudgets",
    legacyTranslationKey: () => "models.tabs.accessGroupBudgets",
    focus: { group: "accessAndCost", order: 0 },
    isVisible: isWritableAdmin,
    panel: AccessGroupBudgetsPanel,
    showBetaBadge: true,
  },
  {
    id: "price-data",
    translationKey: "focusModelsAndEndpoints.innerTabs.priceDataReload",
    legacyTranslationKey: () => "models.tabs.priceData",
    focus: { group: "accessAndCost", order: 1 },
    isVisible: isWritableAdmin,
    panel: PriceDataPanel,
  },
];

const LEGACY_SECTION_ORDER: readonly ModelSectionId[] = [
  "all-models",
  "add",
  "auto-routers",
  "llm-credentials",
  "pass-through",
  "health",
  "retry-settings",
  "model-group-alias",
  "access-group-budgets",
  "price-data",
];

export const getVisibleModelSections = (context: ModelSectionContext): readonly ModelSection[] =>
  MODEL_SECTIONS.filter((section) => section.isVisible(context)).sort(
    (left, right) => LEGACY_SECTION_ORDER.indexOf(left.id) - LEGACY_SECTION_ORDER.indexOf(right.id),
  );

export const renderModelSection = (section: ModelSection, renderer: ModelSectionRenderer = "default") => {
  const Panel = renderer === "focus" ? (section.focusPanel ?? section.panel) : section.panel;
  return <Panel />;
};
