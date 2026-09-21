import { useTranslation } from "react-i18next";
import React from "react";
import { Input } from "@/components/ui/input";

interface ReliabilityRetriesSectionProps {
  routerSettings: { [key: string]: any };
  routerFieldsMetadata: { [key: string]: any };
}

const ReliabilityRetriesSection: React.FC<ReliabilityRetriesSectionProps> = ({
  routerSettings,
  routerFieldsMetadata,
}) => {
  const { t } = useTranslation("gateway");
  const fields: Record<string, { label: string; description: string }> = {
    allowed_fails: {
      label: t("virtualKeys.createKey.optional.allowedFails"),
      description: t("virtualKeys.createKey.optional.allowedFailsDescription"),
    },
    cooldown_time: {
      label: t("virtualKeys.createKey.optional.cooldownTime"),
      description: t("virtualKeys.createKey.optional.cooldownTimeDescription"),
    },
    num_retries: {
      label: t("virtualKeys.createKey.optional.numRetries"),
      description: t("virtualKeys.createKey.optional.numRetriesDescription"),
    },
    timeout: {
      label: t("virtualKeys.createKey.optional.timeout"),
      description: t("virtualKeys.createKey.optional.timeoutDescription"),
    },
    retry_after: {
      label: t("virtualKeys.createKey.optional.retryAfter"),
      description: t("virtualKeys.createKey.optional.retryAfterDescription"),
    },
    model_group_alias: {
      label: t("virtualKeys.createKey.optional.modelGroupAlias"),
      description: t("virtualKeys.createKey.optional.modelGroupAliasDescription"),
    },
  };
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h3 className="text-sm font-medium text-foreground">{t("virtualKeys.createKey.optional.reliability")}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {t("virtualKeys.createKey.optional.reliabilityDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Object.entries(routerSettings)
          .filter(
            ([param]) =>
              param != "fallbacks" &&
              param != "context_window_fallbacks" &&
              param != "routing_strategy_args" &&
              param != "routing_strategy" &&
              param != "enable_tag_filtering" &&
              param != "retry_policy" &&
              param != "model_group_retry_policy" &&
              param != "routing_groups",
          )
          .map(([param, value]) => (
            <div key={param} className="space-y-2">
              <label className="block">
                <span className="text-xs font-medium text-foreground uppercase tracking-wide">
                  {fields[param]?.label ?? routerFieldsMetadata[param]?.ui_field_name ?? param}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                  {fields[param]?.description ?? routerFieldsMetadata[param]?.field_description ?? ""}
                </p>
                <Input
                  name={param}
                  defaultValue={
                    value === null || value === undefined || value === "null"
                      ? ""
                      : typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : value?.toString() || ""
                  }
                  placeholder="—"
                  className="font-mono text-sm w-full"
                />
              </label>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ReliabilityRetriesSection;
