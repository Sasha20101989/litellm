"use client";

import { Waypoints } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cva.config";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

export interface RoutingDecisionTierBoundaries {
  simple_medium?: number;
  medium_complex?: number;
  complex_reasoning?: number;
}

export interface RoutingDecision {
  router_model_name?: string;
  router_type?: string;
  routed_model?: string;
  cause?: string;
  tier?: string;
  tier_label?: string;
  request_type?: string;
  score?: number;
  signals?: string[];
  matched_keyword?: string;
  escalation_keyword?: string;
  classifier_model?: string;
  escalated?: boolean;
  tier_boundaries?: RoutingDecisionTierBoundaries;
}

/**
 * The tier the score alone would have produced, given the boundaries in effect when
 * the decision was made. Rendered as the bracket that explains a score, so it must
 * use the snapshot rather than today's config.
 */
function describeScoreAgainstBoundaries(
  score: number,
  boundaries?: RoutingDecisionTierBoundaries,
  renamed?: boolean,
  t?: TFunction<"logs">,
): string | null {
  if (!boundaries) return null;
  const {
    simple_medium: simpleMedium,
    medium_complex: mediumComplex,
    complex_reasoning: complexReasoning,
  } = boundaries;
  if (simpleMedium === undefined || mediumComplex === undefined || complexReasoning === undefined) return null;

  const named = (range: string, tier: string): string => (renamed ? range : `${range}, ${tier}`);
  if (!t) return null;
  if (score < simpleMedium) return named(t("routing.below", { value: simpleMedium }), "SIMPLE");
  if (score < mediumComplex) return named(t("routing.between", { from: simpleMedium, to: mediumComplex }), "MEDIUM");
  if (score < complexReasoning)
    return named(t("routing.between", { from: mediumComplex, to: complexReasoning }), "COMPLEX");
  return named(t("routing.atOrAbove", { value: complexReasoning }), "REASONING");
}

function describeCause(decision: RoutingDecision, t: TFunction<"logs">): string {
  const { cause, classifier_model: classifierModel, matched_keyword: matchedKeyword, tier_label: tierLabel } = decision;

  switch (cause) {
    case "heuristic_scorer":
      return t("routing.heuristicScorer");
    case "reasoning_override":
      return t("routing.reasoningOverride", { tier: tierLabel ?? "REASONING" });
    case "llm_classifier":
      return classifierModel ? `${t("routing.llmClassifier")} (${classifierModel})` : t("routing.llmClassifier");
    case "literal_keyword_match":
      return matchedKeyword ? t("routing.keywordMatchValue", { keyword: matchedKeyword }) : t("routing.keywordMatch");
    case "semantic_keyword_match":
      return t("routing.semanticKeywordMatch");
    case "session_affinity_pin":
      return t("routing.pinnedToSession");
    case "session_affinity_escalation":
      return t("routing.escalatedFromSession");
    case "quality_tier":
      return t("routing.qualityTierMapping");
    case "keyword":
      return matchedKeyword ? t("routing.keywordMatchValue", { keyword: matchedKeyword }) : t("routing.keywordMatch");
    case "bandit":
      return t("routing.adaptiveBandit");
    case "default_fallback":
      return t("routing.defaultNoRoute");
    case "default_model_fallback":
      return t("routing.defaultClassifierFailed");
    default:
      return cause ?? t("routing.unknown");
  }
}

/**
 * A request can ask to escalate and get nowhere, when its tier is already the highest
 * one configured. That row still has to say the caller asked, otherwise it reads as an
 * ordinary route; it just must not claim a bump that did not happen. Only called when
 * the request escalated or asked to, so there is no "did not escalate" case.
 */
function describeEscalation(escalated: boolean, keyword: string | undefined, t: TFunction<"logs">): string {
  if (escalated) return keyword ? t("routing.yesKeyword", { keyword }) : t("routing.yes");
  return keyword ? t("routing.requestedKeywordHighest", { keyword }) : t("routing.requestedHighest");
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1 text-sm">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

export function RoutingDecisionCard({
  decision,
  className,
}: {
  decision?: RoutingDecision | null;
  className?: string;
}) {
  const { t } = useTranslation("logs");
  if (!decision || !decision.cause) return null;

  const {
    router_model_name: routerModelName,
    router_type: routerType,
    routed_model: routedModel,
    tier,
    tier_label: tierLabel,
    request_type: requestType,
    score,
    signals,
    escalated,
    escalation_keyword: escalationKeyword,
    tier_boundaries: tierBoundaries,
  } = decision;

  // On an override row the score did not decide the tier, so showing it against a
  // boundary would claim something untrue. Keyed off the cause rather than a marker
  // inside `signals`, which redaction can remove.
  const scoreExplanation =
    score !== undefined && decision.cause !== "reasoning_override"
      ? describeScoreAgainstBoundaries(score, tierBoundaries, tierLabel !== undefined, t)
      : null;

  return (
    <div className={cn("mb-6 w-full max-w-full overflow-hidden rounded-lg bg-white shadow-sm", className)}>
      <div className="border-b px-4 py-2.5 text-sm font-medium">{t("routing.title")}</div>
      <div className="px-4 py-3">
        {routerModelName && (
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Waypoints size={14} aria-hidden />
            <span>{routerModelName}</span>
            {routerType && (
              <span className="font-normal text-muted-foreground">
                (
                {routerType === "adaptive"
                  ? t("routing.adaptiveRouter")
                  : routerType === "quality"
                    ? t("routing.qualityRouter")
                    : routerType === "complexity"
                      ? "Auto-Router v2"
                      : routerType}
                )
              </span>
            )}
          </div>
        )}

        {tier && (
          <Row label={t("routing.tier")}>
            <Badge variant="secondary" className="font-normal">
              {tierLabel ?? tier}
            </Badge>
          </Row>
        )}

        {requestType && <Row label={t("routing.requestType")}>{requestType}</Row>}

        <Row label={t("routing.decidedBy")}>{describeCause(decision, t)}</Row>

        {score !== undefined && (
          <Row label={t("routing.score")}>
            <span className="tabular-nums">{score.toFixed(2)}</span>
            {scoreExplanation && <span className="ml-2 text-muted-foreground">({scoreExplanation})</span>}
          </Row>
        )}

        {routedModel && <Row label={t("routing.routedTo")}>{routedModel}</Row>}

        {escalated !== undefined && (
          <Row label={t("routing.escalated")}>{describeEscalation(escalated, escalationKeyword, t)}</Row>
        )}

        {signals && signals.length > 0 && (
          <Row label={t("routing.signals")}>
            <span className="flex flex-wrap gap-1">
              {signals.map((signal) => (
                <Badge key={signal} variant="outline" className="font-normal">
                  {signal}
                </Badge>
              ))}
            </span>
          </Row>
        )}
      </div>
    </div>
  );
}

export default RoutingDecisionCard;
