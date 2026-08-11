"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ApiError } from "@/lib/http/client";
import { formatNumberWithCommas } from "@/utils/dataUtils";

import {
  ALL_ROUTERS,
  bucketRows,
  bucketTurnsTotal,
  groupKey,
  expiredMissShare,
  groupLabel,
  pctLabel,
  viewFor,
  type AutoRouterBenchmarksResponse,
  type AutoRouterCacheStats,
  type BenchmarkView,
  type BenchmarkWindow,
  type BucketRow,
} from "./autoRouterBenchmarks";
import { usd } from "./costOptimizationUtils";
import { useAutoRouterBenchmarks } from "./useAutoRouterBenchmarks";

const Message: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>
);

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Card size="sm">
    <CardHeader>
      <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-semibold text-foreground">{value}</p>
    </CardContent>
  </Card>
);

const HeroCard: React.FC<{ view: BenchmarkView }> = ({ view }) => {
  const { t } = useTranslation("costOptimization");
  const stats = view.stats;
  const cheaper = stats.saved_spend >= 0;
  return (
    <Card className="overflow-hidden py-0">
      <div className="grid md:grid-cols-[4fr_3fr_5fr]">
        <div className="flex flex-col justify-center gap-3 p-6">
          <p className="text-sm text-muted-foreground">{t("autoRouter.totalEstimatedSavings")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-5xl font-semibold tracking-tight text-foreground">{usd(stats.saved_spend)}</p>
            <Badge
              variant="secondary"
              className={cheaper ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-destructive"}
            >
              {cheaper ? "-" : "+"}
              {Math.abs(stats.saved_pct).toFixed(0)}%
            </Badge>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 pb-6 md:py-6">
          <dl className="divide-y text-sm">
            <div className="flex items-baseline justify-between gap-6 py-3">
              <dt className="text-muted-foreground">{t("autoRouter.actualSpend")}</dt>
              <dd className="font-medium tabular-nums text-foreground">{usd(stats.spend)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-3">
              <dt className="text-muted-foreground">{t("autoRouter.estimatedHighestSpend")}</dt>
              <dd className="font-medium tabular-nums text-foreground">{usd(stats.baseline_spend)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col border-t md:border-t-0 md:border-l">
          <div className="grid flex-1 grid-cols-2 divide-x">
            <div className="flex flex-col justify-center gap-1 px-6 py-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("autoRouter.totalSessions")}
              </p>
              <p className="text-3xl font-semibold text-foreground">{stats.sessions.toLocaleString()}</p>
            </div>
            <div className="flex flex-col justify-center gap-1 px-6 py-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("autoRouter.totalTurns")}</p>
              <p className="text-3xl font-semibold text-foreground">{stats.turns.toLocaleString()}</p>
            </div>
          </div>
          <dl className="flex flex-col divide-y border-t text-sm">
            <div className="flex items-center justify-between gap-2 px-6 py-3">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("autoRouter.avgSavedPerSession")}
              </dt>
              <dd className="text-lg font-semibold tabular-nums text-foreground">{usd(stats.saved_per_session)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  );
};

const StackedTurnBar: React.FC<{ buckets: BucketRow[] }> = ({ buckets }) => {
  const { t } = useTranslation("costOptimization");
  const segments = buckets.filter((b) => b.turns > 0);
  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-sm"
        role="img"
        aria-label={t("autoRouter.shareByBucket")}
      >
        {segments.map((b) => (
          <div
            key={b.key}
            className={`${b.fill} first:rounded-l-sm last:rounded-r-sm`}
            style={{ width: `${b.sharePct}%` }}
            title={`${b.label}: ${t("autoRouter.turnsCount", { count: b.turns.toLocaleString() })}`}
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
  const { t } = useTranslation("costOptimization");

  return (
    <Table className="border-b">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-[11px] uppercase tracking-wide">{t("autoRouter.bucket")}</TableHead>
          <TableHead className="text-right text-[11px] uppercase tracking-wide">{t("autoRouter.turns")}</TableHead>
          <TableHead className="w-1/2" />
          <TableHead className="text-right text-[11px] uppercase tracking-wide">{t("autoRouter.hitRate")}</TableHead>
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
  const { t } = useTranslation("costOptimization");
  const buckets = bucketRows(cache).map((bucket) => ({
    ...bucket,
    label: t(`autoRouter.buckets.${bucket.key}.label`),
    sublabel: t(`autoRouter.buckets.${bucket.key}.description`),
  }));
  const total = bucketTurnsTotal(cache);
  const expiredMissPct = expiredMissShare(cache);
  return (
    <Card className="overflow-hidden py-0">
      <div className="grid lg:grid-cols-[1fr_3fr]">
        <div className="flex flex-col border-b p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-1 flex-col justify-center gap-3">
            <p className="text-sm text-muted-foreground">{t("autoRouter.cacheHitRate")}</p>
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
                    {t("autoRouter.expiredMiss")}
                  </span>
                  <span className="font-medium tabular-nums text-foreground">{pctLabel(expiredMissPct)}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-64">{t("autoRouter.expiredMissInfo")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("autoRouter.shareOfTurns")}</p>
            <p className="text-xs text-muted-foreground">
              {t("autoRouter.turnsMeasured", { count: total.toLocaleString() })}
            </p>
          </div>
          <StackedTurnBar buckets={buckets} />
          <BucketTable buckets={buckets} />
          {cache.unordered_turns > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("autoRouter.unorderedTurns", { count: cache.unordered_turns.toLocaleString() })}
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
}

const BenchmarksBody: React.FC<BenchmarksBodyProps> = ({ isPending, error, data, selectedKey }) => {
  const { t } = useTranslation("costOptimization");
  if (isPending) return <Message>{t("autoRouter.loading")}</Message>;
  if (error instanceof ApiError && error.status === 403) {
    return <Message>{t("autoRouter.adminOnly")}</Message>;
  }
  if (error || !data) return <Message>{t("autoRouter.unavailable")}</Message>;
  if (data.groups.length === 0) return <Message>{t("autoRouter.empty")}</Message>;

  const view = viewFor(data, selectedKey);
  const stats = view.stats;
  const duration =
    stats.avg_session_seconds < 60
      ? t("autoRouter.duration.seconds", { value: Math.round(stats.avg_session_seconds) })
      : stats.avg_session_seconds < 3600
        ? t("autoRouter.duration.minutes", { value: (stats.avg_session_seconds / 60).toFixed(1) })
        : t("autoRouter.duration.hours", { value: (stats.avg_session_seconds / 3600).toFixed(1) });
  return (
    <>
      <HeroCard view={view} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric label={t("autoRouter.avgTurns")} value={stats.avg_turns_per_session.toFixed(1)} />
        <Metric label={t("autoRouter.avgLength")} value={duration} />
        <Metric
          label={t("autoRouter.avgTokens")}
          value={formatNumberWithCommas(stats.avg_tokens_per_session, 1, true)}
        />
      </div>

      <p className="text-xs text-muted-foreground">{t("autoRouter.comparison")}</p>

      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-lg font-semibold text-foreground">{t("autoRouter.cachingTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("autoRouter.cachingDescription")}</p>
        </div>
        <CachingCard cache={stats.cache} />
      </div>
    </>
  );
};

interface AutoRouterBenchmarksTabProps {
  accessToken: string | null;
}

const AutoRouterBenchmarksTab: React.FC<AutoRouterBenchmarksTabProps> = ({ accessToken }) => {
  const { t } = useTranslation("costOptimization");
  const [range, setRange] = useState<BenchmarkWindow>("30d");
  const { data, isPending, error } = useAutoRouterBenchmarks(accessToken, range);
  const [selectedKey, setSelectedKey] = useState<string>(ALL_ROUTERS);

  const groups = data?.groups ?? [];
  const selectedLabel =
    selectedKey === ALL_ROUTERS ? t("autoRouter.all") : data ? viewFor(data, selectedKey).label : t("autoRouter.all");
  const windowLabel = {
    "30d": t("autoRouter.windows.days30"),
    "7d": t("autoRouter.windows.days7"),
    "24h": t("autoRouter.windows.hours24"),
  }[range];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t("autoRouter.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{windowLabel}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Tabs value={range} onValueChange={(value) => setRange(value === "7d" || value === "24h" ? value : "30d")}>
            <TabsList>
              <TabsTrigger value="30d">30d</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="24h">24h</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-full sm:w-64">
            <Select value={selectedKey} onValueChange={(value: string | null) => setSelectedKey(value ?? ALL_ROUTERS)}>
              <SelectTrigger className="w-full">
                <SelectValue>{selectedLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ROUTERS}>{t("autoRouter.all")}</SelectItem>
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

      <BenchmarksBody isPending={isPending} error={error} data={data} selectedKey={selectedKey} />
    </div>
  );
};

export default AutoRouterBenchmarksTab;
