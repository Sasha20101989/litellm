import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface RedisTypeSelectorProps {
  redisType: string;
  redisTypeDescriptions: Readonly<Record<string, string>>;
  onTypeChange: (type: string) => void;
}

const RedisTypeSelector: React.FC<RedisTypeSelectorProps> = ({ redisType, redisTypeDescriptions, onTypeChange }) => {
  const { t } = useTranslation("settings");
  const labels: Record<string, string> = {
    node: t("caching.settings.types.node"),
    cluster: t("caching.settings.types.cluster"),
    sentinel: t("caching.settings.types.sentinel"),
    semantic: t("caching.settings.types.semantic"),
  };
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t("caching.settings.redisType")}</label>
      <Select value={redisType} onValueChange={(value) => value !== null && onTypeChange(value)}>
        <SelectTrigger className="w-full">
          <SelectValue>{labels[redisType] ?? redisType}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(labels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {t(`caching.settings.typeDescriptions.${redisType}`, {
          defaultValue: redisTypeDescriptions[redisType] || t("caching.settings.selectType"),
        })}
      </p>
    </div>
  );
};

export default RedisTypeSelector;
