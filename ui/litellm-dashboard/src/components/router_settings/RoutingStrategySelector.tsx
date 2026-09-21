import { useTranslation } from "react-i18next";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoutingStrategySelectorProps {
  selectedStrategy: string | null;
  availableStrategies: string[];
  routingStrategyDescriptions: { [key: string]: string };
  routerFieldsMetadata: { [key: string]: any };
  onStrategyChange: (strategy: string) => void;
}

const RoutingStrategySelector: React.FC<RoutingStrategySelectorProps> = ({
  selectedStrategy,
  availableStrategies,
  routingStrategyDescriptions,
  routerFieldsMetadata,
  onStrategyChange,
}) => {
  const { t } = useTranslation("gateway");
  const descriptions: Record<string, string> = {
    "simple-shuffle": t("virtualKeys.edit.strategyShuffle"),
    "least-busy": t("virtualKeys.edit.strategyLeastBusy"),
    "latency-based-routing": t("virtualKeys.edit.strategyLatency"),
    "cost-based-routing": t("virtualKeys.edit.strategyCost"),
    "usage-based-routing": t("virtualKeys.edit.strategyUsage"),
    "usage-based-routing-v2": t("virtualKeys.edit.strategyUsageV2"),
  };
  return (
    <div className="space-y-2 max-w-3xl">
      <div>
        <label className="text-xs font-medium text-foreground uppercase tracking-wide">
          {t("virtualKeys.createKey.optional.routingStrategy")}
        </label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          {t("virtualKeys.createKey.optional.routingStrategyDescription")}
        </p>
      </div>
      <div className="routing-strategy-select max-w-3xl">
        <Select
          value={selectedStrategy}
          onValueChange={(strategy: string | null) => strategy && onStrategyChange(strategy)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableStrategies.map((strategy) => (
              <SelectItem key={strategy} value={strategy}>
                <div className="flex flex-col gap-0.5 py-1">
                  <span className="font-mono text-sm font-medium">{strategy}</span>
                  {routingStrategyDescriptions[strategy] && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {descriptions[strategy] ?? routingStrategyDescriptions[strategy]}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RoutingStrategySelector;
