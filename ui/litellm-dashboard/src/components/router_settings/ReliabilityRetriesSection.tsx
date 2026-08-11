import React from "react";
import { Input } from "antd";
import { useTranslation } from "react-i18next";

interface ReliabilityRetriesSectionProps {
  routerSettings: { [key: string]: any };
  routerFieldsMetadata: { [key: string]: any };
  title?: string;
  description?: string;
  fieldLabels?: Record<string, string>;
  fieldDescriptions?: Record<string, string>;
}

const ReliabilityRetriesSection: React.FC<ReliabilityRetriesSectionProps> = ({
  routerSettings,
  routerFieldsMetadata,
  title,
  description,
  fieldLabels,
  fieldDescriptions,
}) => {
  const { t, i18n } = useTranslation("settings");

  const localizedField = (param: string, property: "label" | "help", fallback: string) => {
    const key = `router.fields.${param}.${property}`;
    return i18n.exists(`settings:${key}`) ? t(key) : fallback;
  };

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h3 className="text-sm font-medium text-gray-900">{title ?? t("router.reliability")}</h3>
        <p className="text-xs text-gray-500 mt-1">{description ?? t("router.reliabilityDescription")}</p>
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
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  {fieldLabels?.[param] ||
                    localizedField(param, "label", routerFieldsMetadata[param]?.ui_field_name || param)}
                </span>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">
                  {fieldDescriptions?.[param] ||
                    localizedField(param, "help", routerFieldsMetadata[param]?.field_description || "")}
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
