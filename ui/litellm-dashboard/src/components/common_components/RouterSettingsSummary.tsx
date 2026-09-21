import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { hasRouterSettings } from "./routerSettingsPayload";

interface RouterSettingsSummaryProps {
  routerSettings: Record<string, unknown> | null | undefined;
  emptyText?: string;
}

const fallbackEntries = (fallbacks: unknown): Array<[string, string[]]> => {
  if (!Array.isArray(fallbacks)) return [];
  return fallbacks.flatMap((entry) =>
    entry && typeof entry === "object" ? (Object.entries(entry) as Array<[string, string[]]>) : [],
  );
};

export default function RouterSettingsSummary({ routerSettings, emptyText }: RouterSettingsSummaryProps) {
  const { t } = useTranslation("gateway");
  if (!hasRouterSettings(routerSettings)) {
    return <div className="text-muted-foreground">{emptyText ?? t("virtualKeys.sharedDetails.noRouterSettings")}</div>;
  }

  const settings = routerSettings as Record<string, unknown>;
  const fallbacks = fallbackEntries(settings.fallbacks);

  return (
    <div className="space-y-1 text-sm">
      {settings.routing_strategy != null && (
        <div>
          {t("virtualKeys.sharedDetails.routingStrategy")}:{" "}
          <Badge variant="secondary">{String(settings.routing_strategy)}</Badge>
        </div>
      )}
      {settings.num_retries != null && (
        <div>
          {t("virtualKeys.sharedDetails.numRetries")}: {String(settings.num_retries)}
        </div>
      )}
      {settings.allowed_fails != null && (
        <div>
          {t("virtualKeys.sharedDetails.allowedFails")}: {String(settings.allowed_fails)}
        </div>
      )}
      {settings.cooldown_time != null && (
        <div>
          {t("virtualKeys.sharedDetails.cooldown")}:{" "}
          {t("virtualKeys.sharedDetails.seconds", { value: String(settings.cooldown_time) })}
        </div>
      )}
      {settings.timeout != null && (
        <div>
          {t("virtualKeys.sharedDetails.timeout")}:{" "}
          {t("virtualKeys.sharedDetails.seconds", { value: String(settings.timeout) })}
        </div>
      )}
      {settings.retry_after != null && (
        <div>
          {t("virtualKeys.sharedDetails.retryAfter")}:{" "}
          {t("virtualKeys.sharedDetails.seconds", { value: String(settings.retry_after) })}
        </div>
      )}
      {Boolean(settings.enable_tag_filtering) && (
        <div>
          {t("virtualKeys.sharedDetails.tagFiltering")}: {t("virtualKeys.sharedDetails.enabled")}
        </div>
      )}
      {fallbacks.length > 0 && (
        <div>
          <div>{t("virtualKeys.sharedDetails.fallbacks")}:</div>
          <div className="mt-1 space-y-1">
            {fallbacks.map(([model, targets]) => (
              <div key={model} className="text-xs text-muted-foreground">
                <span className="font-medium">{model}</span>
                <span className="mx-1 text-muted-foreground">-&gt;</span>
                {Array.isArray(targets) ? targets.join(", ") : String(targets)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
