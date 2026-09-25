"use client";

import { useTranslation } from "react-i18next";
import React, { useState } from "react";

import type { AutoRouterDeployment } from "@/app/(dashboard)/hooks/models/useModels";
import { useAutoRouters } from "@/app/(dashboard)/hooks/models/useModels";
import AdvancedDatePicker from "@/components/shared/advanced_date_picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ApiError } from "@/lib/http/client";
import { formatNumberWithCommas } from "@/utils/dataUtils";

import {
  ALL_ROUTERS,
  bucketRows,
  bucketTurnsTotal,
  durationLabel,
  groupKey,
  expiredMissShare,
  groupLabel,
  pctLabel,
  viewFor,
  type AutoRouterBenchmarksResponse,
  type AutoRouterCacheStats,
  type BenchmarkView,
  type BucketRow,
} from "./autoRouterBenchmarks";
import { classificationRatePer1kTurns, formatRangeLabel, usd } from "./costOptimizationUtils";
import ShadowEvalSection from "./ShadowEvalSection";
import TierTurnsChart from "./TierTurnsChart";
import { useAutoRouterBenchmarks } from "./useAutoRouterBenchmarks";
import { DailyActivityRange } from "./useDailyActivityRange";

const Message: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>
);

const Metric: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <Card size="sm">
    <CardHeader>
      <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-wrap items-baseline gap-2">
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </CardContent>
  </Card>
);

const SpendRow: React.FC<{ label: string; value: string; hint?: string; subdued?: boolean }> = ({
  label,
  value,
  hint,
  subdued,
}) => (
  <dl className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2">
    <dt className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground">
      {label}
      {hint && <span className="text-xs">{hint}</span>}
    </dt>
    <dd
      className={`min-w-0 break-all tabular-nums ${subdued ? "text-sm font-normal text-muted-foreground" : "text-base font-semibold text-foreground"}`}
    >
      {value}
    </dd>
  </dl>
);

const HeroCard: React.FC<{ view: BenchmarkView }> = ({ view }) => {
  const { t } = useTranslation("gateway");
  const stats = view.stats;
  const savedSpend = stats.saved_spend;
  const savedPct = stats.saved_pct;
  const savings = savedSpend != null && savedPct != null ? { savedSpend, savedPct } : null;
  const cheaper = savings != null && savings.savedSpend >= 0;
  return (
    <Card className="overflow-hidden py-0">
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center gap-2 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("virtualKeys.sharedDetails.totalSavings")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="min-w-0 break-all text-center text-4xl font-semibold tracking-tight text-foreground xl:text-6xl">
              {savings == null ? t("virtualKeys.sharedDetails.unavailable") : usd(savings.savedSpend)}
            </p>
            {savings != null && (
              <Badge
                variant="secondary"
                className={`h-6 px-2.5 text-sm ${cheaper ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
              >
                {savings.savedSpend !== 0 && (cheaper ? "-" : "+")}
                {Math.abs(savings.savedPct).toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center border-t p-6 md:border-t-0 md:border-l">
          <SpendRow label={t("virtualKeys.sharedDetails.actualRouterSpend")} value={usd(stats.spend)} />
          <div className="mb-3 border-l-2 pl-4">
            <SpendRow
              subdued
              label={t("virtualKeys.sharedDetails.llmSpend")}
              value={
                stats.classifier_cost == null
                  ? t("virtualKeys.sharedDetails.unavailable")
                  : usd(stats.spend - stats.classifier_cost)
              }
            />
            <SpendRow
              subdued
              label={t("virtualKeys.sharedDetails.classificationCost")}
              value={
                stats.classifier_cost == null ? t("virtualKeys.sharedDetails.unavailable") : usd(stats.classifier_cost)
              }
              hint={
                stats.classifier_cost == null
                  ? undefined
                  : classificationRatePer1kTurns(
                      stats.classifier_cost,
                      stats.turns,
                      t("virtualKeys.sharedDetails.perThousandTurns"),
                    )
              }
            />
          </div>
          {stats.classifier_cost == null && (
            <p className="mb-3 text-xs text-muted-foreground">
              {t("virtualKeys.sharedDetails.noClassificationBreakdown")}
            </p>
          )}
          <Separator />
          <SpendRow
            label={t("virtualKeys.sharedDetails.highestTierSpend")}
            value={
              stats.baseline_spend == null ? t("virtualKeys.sharedDetails.unavailable") : usd(stats.baseline_spend)
            }
          />
        </div>
      </div>
    </Card>
  );
};

const StackedTurnBar: React.FC<{ buckets: BucketRow[] }> = ({ buckets }) => {
  const { t } = useTranslation("gateway");
  const segments = buckets.filter((b) => b.turns > 0);
  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex h-2.5 w-full gap-0.5 overflow-hidden rounded-sm ${segments.length === 0 ? "bg-muted" : ""}`}
        role="img"
        aria-label={t("virtualKeys.sharedDetails.turnShareByBucket")}
      >
        {segments.map((b) => (
          <div
            key={b.key}
            className={`${b.fill} first:rounded-l-sm last:rounded-r-sm`}
            style={{ width: `${b.sharePct}%` }}
            title={t("virtualKeys.sharedDetails.bucketTurns", { label: b.label, count: b.turns })}
          />
        ))}
      </div>
      <div className="flex w-full gap-0.5 text-[11px] text-muted-foreground">
        {segments.map((b) => (
          <span key={b.key} className="whitespace-nowrap" style={{ width: `${b.sharePct}%` }}>
            {b.sharePct}%
          </span>
        ))}
      </div>
    </div>
  );
};

const BucketTable: React.FC<{ buckets: BucketRow[] }> = ({ buckets }) => {
  const { t } = useTranslation("gateway");
  return (
    <Table className="border-b">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-[11px] uppercase tracking-wide">{t("virtualKeys.sharedDetails.bucket")}</TableHead>
          <TableHead className="text-right text-[11px] uppercase tracking-wide">
            {t("virtualKeys.sharedDetails.turns")}
          </TableHead>
          <TableHead className="w-1/2" />
          <TableHead className="text-right text-[11px] uppercase tracking-wide">
            {t("virtualKeys.sharedDetails.hitRate")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buckets.map((b) => (
          <TableRow key={b.key} className="hover:bg-transparent">
            <TableCell className="text-foreground">
              <span className="flex items-center gap-2">
                <span className={`inline-block size-2 shrink-0 rounded-sm ${b.fill}`} aria-hidden />
                <span>
                  {b.label}
                  <span className="block text-xs font-normal text-muted-foreground">{b.sublabel}</span>
                </span>
              </span>
            </TableCell>
            <TableCell className="text-right align-middle tabular-nums text-foreground">
              {b.turns.toLocaleString()}
            </TableCell>
            <TableCell className="align-middle">
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground" style={{ width: `${b.hitRatePct}%` }} aria-hidden />
              </div>
            </TableCell>
            <TableCell className="text-right align-middle font-medium tabular-nums text-foreground">
              {pctLabel(b.hitRatePct)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const CachingCard: React.FC<{ cache: AutoRouterCacheStats }> = ({ cache }) => {
  const { t } = useTranslation("gateway");
  const bucketLabels = {
    same_model: {
      label: t("virtualKeys.sharedDetails.sameModel"),
      sublabel: t("virtualKeys.sharedDetails.sameModelHelp"),
    },
    first_visit: {
      label: t("virtualKeys.sharedDetails.firstVisit"),
      sublabel: t("virtualKeys.sharedDetails.firstVisitHelp"),
    },
    return_to_tier: {
      label: t("virtualKeys.sharedDetails.returnToTier"),
      sublabel: t("virtualKeys.sharedDetails.returnToTierHelp"),
    },
  };
  const buckets = bucketRows(cache).map((bucket) => ({ ...bucket, ...bucketLabels[bucket.key] }));
  const total = bucketTurnsTotal(cache);
  const expiredMissPct = expiredMissShare(cache);
  return (
    <Card className="overflow-hidden py-0">
      <div className="grid lg:grid-cols-[1fr_3fr]">
        <div className="flex flex-col border-b p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-1 flex-col justify-center gap-3">
            <p className="text-sm text-muted-foreground">{t("virtualKeys.sharedDetails.cacheHitRate")}</p>
            <p className="text-5xl font-semibold tracking-tight text-foreground">{pctLabel(cache.hit_rate_pct)}</p>
          </div>
          {expiredMissPct === null ? null : (
            <TooltipProvider delay={200}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="flex w-full cursor-default items-baseline justify-between gap-2 border-t pt-3 text-left"
                    />
                  }
                >
                  <span className="text-sm text-muted-foreground underline decoration-dotted underline-offset-2">
                    {t("virtualKeys.sharedDetails.expiredMiss")}
                  </span>
                  <span className="font-medium tabular-nums text-foreground">{pctLabel(expiredMissPct)}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-64">{t("virtualKeys.sharedDetails.expiredMissHelp")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {t("virtualKeys.sharedDetails.turnShare")}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="text-lg font-semibold tabular-nums text-foreground">{total.toLocaleString()}</span>{" "}
              {t("virtualKeys.sharedDetails.turnsMeasured")}
            </p>
          </div>
          <StackedTurnBar buckets={buckets} />
          <BucketTable buckets={buckets} />
          {cache.unordered_turns > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("virtualKeys.sharedDetails.unorderedTurns", { count: cache.unordered_turns })}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

interface BenchmarksBodyProps {
  isPending: boolean;
  error: unknown;
  data: AutoRouterBenchmarksResponse | undefined;
  selectedKey: string;
  autoRouters: readonly AutoRouterDeployment[];
}

const BenchmarksBody: React.FC<BenchmarksBodyProps> = ({ isPending, error, data, selectedKey, autoRouters }) => {
  const { t } = useTranslation("gateway");
  if (isPending) return <Message>{t("virtualKeys.sharedDetails.loadingRouterUsage")}</Message>;
  if (error instanceof ApiError && error.status === 403) {
    return <Message>{t("virtualKeys.sharedDetails.routerUsageAdminOnly")}</Message>;
  }
  if (error || !data) return <Message>{t("virtualKeys.sharedDetails.routerUsageUnavailable")}</Message>;

  const view = viewFor(data, selectedKey);
  const stats = view.stats;
  return (
    <>
      <HeroCard view={view} />

      <TierTurnsChart view={view} autoRouters={autoRouters} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label={t("virtualKeys.sharedDetails.avgSavedSession")}
          value={
            stats.saved_per_session == null ? t("virtualKeys.sharedDetails.unavailable") : usd(stats.saved_per_session)
          }
          hint={t("virtualKeys.sharedDetails.sessions", { count: stats.sessions })}
        />
        <Metric label={t("virtualKeys.sharedDetails.avgTurnsSession")} value={stats.avg_turns_per_session.toFixed(1)} />
        <Metric
          label={t("virtualKeys.sharedDetails.avgSessionLength")}
          value={durationLabel(stats.avg_session_seconds)}
        />
        <Metric
          label={t("virtualKeys.sharedDetails.avgTokensSession")}
          value={formatNumberWithCommas(stats.avg_tokens_per_session, 1, true)}
        />
      </div>

      <p className="text-xs text-muted-foreground">{t("virtualKeys.sharedDetails.routerSavingsHelp")}</p>

      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-lg font-semibold text-foreground">{t("virtualKeys.sharedDetails.promptCaching")}</h3>
          <p className="text-xs text-muted-foreground">{t("virtualKeys.sharedDetails.bucketHelp")}</p>
        </div>
        <CachingCard cache={stats.cache} />
      </div>
    </>
  );
};

interface AutoRouterBenchmarksTabProps {
  accessToken: string | null;
  activity: Pick<DailyActivityRange, "dateValue" | "onDateChange">;
  apiKey?: string;
}

export const AutoRouterUsageView: React.FC<AutoRouterBenchmarksTabProps> = ({ accessToken, activity, apiKey }) => {
  const { t, i18n } = useTranslation("gateway");
  const { dateValue, onDateChange } = activity;
  const { data, isPending, error } = useAutoRouterBenchmarks(accessToken, dateValue, apiKey);
  const [selectedKey, setSelectedKey] = useState<string>(ALL_ROUTERS);
  const { data: autoRouters } = useAutoRouters();

  const groups = data?.groups ?? [];
  const selectedGroup = groups.find((group) => groupKey(group) === selectedKey);
  const selectedLabel = selectedGroup ? groupLabel(selectedGroup, groups) : t("virtualKeys.sharedDetails.allRouters");
  const rangeLabel = formatRangeLabel(dateValue.from, dateValue.to, i18n.language);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t("virtualKeys.sharedDetails.routerUsage")}</h2>
          {rangeLabel && <p className="mt-1 text-sm text-muted-foreground">{rangeLabel} (UTC)</p>}
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <AdvancedDatePicker value={dateValue} onValueChange={onDateChange} />
          <div className="w-full sm:w-64">
            <Select value={selectedKey} onValueChange={(value: string | null) => setSelectedKey(value ?? ALL_ROUTERS)}>
              <SelectTrigger className="w-full">
                <SelectValue>{selectedLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ROUTERS}>{t("virtualKeys.sharedDetails.allRouters")}</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={groupKey(g)} value={groupKey(g)}>
                    {groupLabel(g, groups)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <BenchmarksBody
        isPending={isPending}
        error={error}
        data={data}
        selectedKey={selectedKey}
        autoRouters={autoRouters ?? []}
      />
    </div>
  );
};

const AutoRouterBenchmarksTab: React.FC<AutoRouterBenchmarksTabProps> = ({ accessToken, activity }) => {
  const { t } = useTranslation("gateway");
  const [visitedTabs, setVisitedTabs] = useState<readonly string[]>(["usage"]);

  const handleTabChange = (value: unknown) => {
    if (typeof value !== "string") {
      return;
    }

    setVisitedTabs((currentTabs) => (currentTabs.includes(value) ? currentTabs : [...currentTabs, value]));
  };

  return (
    <Tabs defaultValue="usage" onValueChange={handleTabChange} className="w-full gap-4">
      <TabsList>
        <TabsTrigger value="usage" className="px-3">
          {t("sync.autoRouterUsage")}
        </TabsTrigger>
        <TabsTrigger value="shadow-evals" className="px-3">
          {t("sync.shadowEvaluations")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="usage" keepMounted={visitedTabs.includes("usage")}>
        <AutoRouterUsageView accessToken={accessToken} activity={activity} />
      </TabsContent>
      <TabsContent value="shadow-evals" keepMounted={visitedTabs.includes("shadow-evals")}>
        <ShadowEvalSection />
      </TabsContent>
    </Tabs>
  );
};

export default AutoRouterBenchmarksTab;
