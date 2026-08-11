"use client";

import React from "react";
import { PiggyBank } from "lucide-react";
import { Alert, Tabs } from "antd";
import { useTranslation } from "react-i18next";

import useCan from "@/app/(dashboard)/hooks/useCan";
import UsageTab from "./UsageTab";
import PromptCompressionTab from "./PromptCompressionTab";
import PromptCachingTab from "./PromptCachingTab";
import AutoRouterBenchmarksTab from "./AutoRouterBenchmarksTab";
import { useDailyActivityRange } from "./useDailyActivityRange";

interface CostOptimizationViewProps {
  accessToken: string | null;
  userId: string | null;
  userRole: string;
}

const CostOptimizationView: React.FC<CostOptimizationViewProps> = ({ accessToken, userId, userRole }) => {
  const { t } = useTranslation("costOptimization");
  const activity = useDailyActivityRange(accessToken, userId, userRole);
  const canViewProxyWideCostData = useCan("viewProxyWideCostData");

  const items = [
    {
      key: "usage",
      label: t("page.tabs.overall"),
      children: <UsageTab accessToken={accessToken} activity={activity} />,
    },
    ...(canViewProxyWideCostData
      ? [
          {
            key: "compression",
            label: t("page.tabs.compression"),
            children: <PromptCompressionTab accessToken={accessToken} />,
          },
          {
            key: "caching",
            label: t("page.tabs.caching"),
            children: <PromptCachingTab accessToken={accessToken} activity={activity} />,
          },
          {
            key: "autorouter-usage",
            label: t("page.tabs.autoRouter"),
            children: <AutoRouterBenchmarksTab accessToken={accessToken} />,
          },
        ]
      : []),
  ];

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <PiggyBank className="size-6 text-emerald-600" strokeWidth={1.75} />
          <h1 className="text-xl font-semibold text-foreground">{t("page.title")}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("page.description")}</p>
      </div>

      <Alert
        type="info"
        showIcon
        message={t("page.experimental")}
        description={
          <span>
            {t("page.feedback")}{" "}
            <a
              href="https://github.com/BerriAI/litellm/discussions/32168"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {t("page.here")}
            </a>
          </span>
        }
      />

      <Tabs defaultActiveKey="usage" items={items} />
    </div>
  );
};

export default CostOptimizationView;
