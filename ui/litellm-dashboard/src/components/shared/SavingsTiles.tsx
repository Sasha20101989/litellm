"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import SummaryCard from "@/components/shared/SummaryCard";
import {
  autorouterOf,
  cachingOf,
  compressionOf,
  gatewayAttributedCachingOf,
  SAVINGS_DRIVERS,
  savedTokensOf,
  sumOverDays,
  usd,
} from "@/app/(dashboard)/cost-optimization/_components/costOptimizationUtils";
import { DailyData } from "@/components/UsagePage/types";
import { formatNumberWithCommas } from "@/utils/dataUtils";

// The total sums SAVINGS_DRIVERS, so it is by construction the sum of what the
// charts plot; the donut and timelines derive from the same list in costOptimizationUtils.
const useSavingsTotals = (results: DailyData[]) =>
  useMemo(
    () => ({
      compression: sumOverDays(results, compressionOf),
      caching: sumOverDays(results, cachingOf),
      autorouter: sumOverDays(results, autorouterOf),
      gatewayAttributedCaching: sumOverDays(results, gatewayAttributedCachingOf),
      savedTokens: sumOverDays(results, savedTokensOf),
      total: SAVINGS_DRIVERS.reduce((sum, { of }) => sum + sumOverDays(results, of), 0),
    }),
    [results],
  );

const SavingsTiles = ({ results, isLoading }: { results: DailyData[]; isLoading: boolean }) => {
  const { t } = useTranslation("gateway");
  const totals = useSavingsTotals(results);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label={t("virtualKeys.savings.totalSaved")}
        value={usd(totals.total)}
        hint={isLoading ? t("virtualKeys.savings.loadingShort") : t("virtualKeys.savings.totalSavedHint")}
        info={t("virtualKeys.savings.totalSavedInfo")}
      />
      <SummaryCard
        label={t("virtualKeys.savings.compression")}
        value={usd(totals.compression)}
        hint={t("virtualKeys.savings.tokensCompressed", { count: formatNumberWithCommas(totals.savedTokens) })}
        info={t("virtualKeys.savings.compressionInfo")}
      />
      <SummaryCard
        label={t("virtualKeys.savings.promptCaching")}
        value={usd(totals.gatewayAttributedCaching)}
        hint={t("virtualKeys.savings.injected")}
        secondary={{ label: t("virtualKeys.savings.total"), value: usd(totals.caching) }}
        info={t("virtualKeys.savings.promptCachingInfo")}
      />
      <SummaryCard
        label={t("virtualKeys.savings.autoRouter")}
        value={usd(totals.autorouter)}
        hint={t("virtualKeys.savings.autoRouterHint")}
        info={t("virtualKeys.savings.autoRouterInfo")}
      />
    </div>
  );
};

export default SavingsTiles;
