import React from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Database,
  DatabaseBackup,
  DollarSign,
  Hash,
  History,
  Lightbulb,
  Wrench,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PROMPT_CACHE_CREATION_TOOLTIP, PROMPT_CACHE_READ_TOOLTIP } from "@/utils/promptCacheUsage";
import { useTranslation } from "react-i18next";

const RESPONSE_CACHE_TOOLTIP =
  "This response was replayed from LiteLLM's response cache. The request never reached the provider, so it did not read from or write to the provider's own prompt cache.";

export interface TokenUsage {
  completionTokens?: number;
  promptTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
  cost?: number;
  servedFromResponseCache?: boolean;
}

interface ResponseMetricsProps {
  timeToFirstToken?: number;
  totalLatency?: number;
  usage?: TokenUsage;
  toolName?: string;
}

interface MetricItemProps {
  label: string;
  tooltip: string;
  icon: React.ReactNode;
  value: string;
}

function MetricItem({ label, tooltip, icon, value }: MetricItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<div className="flex items-center gap-1" aria-label={`${label}: ${value}`} />}>
        {icon}
        <span>
          {label}: {value}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function ResponseCacheIndicator() {
  const { t } = useTranslation("chat");
  return (
    <MetricItem
      label={t("details.responseCache")}
      tooltip={t("details.responseCacheTooltip", { defaultValue: RESPONSE_CACHE_TOOLTIP })}
      icon={<History className="size-3" aria-hidden="true" />}
      value={t("details.cacheHit")}
    />
  );
}

function PromptCacheChips({ usage }: { usage?: TokenUsage }) {
  const { t } = useTranslation("chat");
  if (usage?.servedFromResponseCache) {
    return <ResponseCacheIndicator />;
  }

  const readTokens = usage?.cacheReadTokens ?? 0;
  const creationTokens = usage?.cacheCreationTokens ?? 0;

  return (
    <>
      {readTokens > 0 && (
        <MetricItem
          label={t("details.cacheRead")}
          tooltip={t("details.cacheReadTooltip", { defaultValue: PROMPT_CACHE_READ_TOOLTIP })}
          icon={<Database className="size-3" aria-hidden="true" />}
          value={String(readTokens)}
        />
      )}

      {creationTokens > 0 && (
        <MetricItem
          label={t("details.cacheWrite")}
          tooltip={t("details.cacheWriteTooltip", { defaultValue: PROMPT_CACHE_CREATION_TOOLTIP })}
          icon={<DatabaseBackup className="size-3" aria-hidden="true" />}
          value={String(creationTokens)}
        />
      )}
    </>
  );
}

const ResponseMetrics: React.FC<ResponseMetricsProps> = ({ timeToFirstToken, totalLatency, usage, toolName }) => {
  const { t } = useTranslation("chat");
  if (!timeToFirstToken && !totalLatency && !usage) return null;

  return (
    <div className="response-metrics mt-2 flex flex-wrap gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
      {timeToFirstToken !== undefined && (
        <MetricItem
          label={t("details.timeToFirstToken")}
          tooltip={t("details.timeToFirstToken")}
          icon={<Clock className="size-3" aria-hidden="true" />}
          value={`${(timeToFirstToken / 1000).toFixed(2)}s`}
        />
      )}

      {totalLatency !== undefined && (
        <MetricItem
          label={t("details.totalLatency")}
          tooltip={t("details.totalLatency")}
          icon={<Clock className="size-3" aria-hidden="true" />}
          value={`${(totalLatency / 1000).toFixed(2)}s`}
        />
      )}

      {usage?.promptTokens !== undefined && (
        <MetricItem
          label={t("details.input")}
          tooltip={t("details.promptTokens")}
          icon={<ArrowDownToLine className="size-3" aria-hidden="true" />}
          value={String(usage.promptTokens)}
        />
      )}

      <PromptCacheChips usage={usage} />

      {usage?.completionTokens !== undefined && (
        <MetricItem
          label={t("details.output")}
          tooltip={t("details.completionTokens")}
          icon={<ArrowUpFromLine className="size-3" aria-hidden="true" />}
          value={String(usage.completionTokens)}
        />
      )}

      {usage?.reasoningTokens !== undefined && (
        <MetricItem
          label={t("details.reasoning")}
          tooltip={t("details.reasoningTokens")}
          icon={<Lightbulb className="size-3" aria-hidden="true" />}
          value={String(usage.reasoningTokens)}
        />
      )}

      {usage?.totalTokens !== undefined && (
        <MetricItem
          label={t("details.total")}
          tooltip={t("details.totalTokens")}
          icon={<Hash className="size-3" aria-hidden="true" />}
          value={String(usage.totalTokens)}
        />
      )}

      {typeof usage?.cost === "number" && Number.isFinite(usage.cost) && (
        <MetricItem
          label={t("details.cost")}
          tooltip={t("details.cost")}
          icon={<DollarSign className="size-3" aria-hidden="true" />}
          value={`$${usage.cost.toFixed(6)}`}
        />
      )}

      {toolName && (
        <MetricItem
          label={t("details.tool")}
          tooltip={t("details.toolUsed")}
          icon={<Wrench className="size-3" aria-hidden="true" />}
          value={toolName}
        />
      )}
    </div>
  );
};

export default ResponseMetrics;
