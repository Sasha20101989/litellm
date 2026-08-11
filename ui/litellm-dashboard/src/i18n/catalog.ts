import { enAuth } from "./locales/en/auth";
import { enCommon } from "./locales/en/common";
import { enChat } from "./locales/en/chat";
import { enNavigation } from "./locales/en/navigation";
import { enGateway } from "./locales/en/gateway";
import { enUsage } from "./locales/en/usage";
import { enCostOptimization } from "./locales/en/costOptimization";
import { enLogs } from "./locales/en/logs";
import { enManagement } from "./locales/en/management";
import { enSettings } from "./locales/en/settings";
import { ruAuth } from "./locales/ru/auth";
import { ruCommon } from "./locales/ru/common";
import { ruChat } from "./locales/ru/chat";
import { ruNavigation } from "./locales/ru/navigation";
import { ruGateway } from "./locales/ru/gateway";
import { ruUsage } from "./locales/ru/usage";
import { ruCostOptimization } from "./locales/ru/costOptimization";
import { ruLogs } from "./locales/ru/logs";
import { ruManagement } from "./locales/ru/management";
import { ruSettings } from "./locales/ru/settings";

export const TRANSLATION_NAMESPACES = [
  "common",
  "auth",
  "navigation",
  "gateway",
  "chat",
  "usage",
  "costOptimization",
  "logs",
  "management",
  "settings",
] as const;

export type TranslationNamespace = (typeof TRANSLATION_NAMESPACES)[number];

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    navigation: enNavigation,
    gateway: enGateway,
    chat: enChat,
    usage: enUsage,
    costOptimization: enCostOptimization,
    logs: enLogs,
    management: enManagement,
    settings: enSettings,
  },
  ru: {
    common: ruCommon,
    auth: ruAuth,
    navigation: ruNavigation,
    gateway: ruGateway,
    chat: ruChat,
    usage: ruUsage,
    costOptimization: ruCostOptimization,
    logs: ruLogs,
    management: ruManagement,
    settings: ruSettings,
  },
} as const;
