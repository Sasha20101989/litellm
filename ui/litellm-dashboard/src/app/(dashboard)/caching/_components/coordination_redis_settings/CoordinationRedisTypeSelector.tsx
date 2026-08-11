import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  COORDINATION_REDIS_TYPES,
  COORDINATION_REDIS_TYPE_DESCRIPTIONS,
  CoordinationRedisType,
} from "./coordinationRedisFields";
import { useTranslation } from "react-i18next";

interface CoordinationRedisTypeSelectorProps {
  redisType: CoordinationRedisType;
  onTypeChange: (type: CoordinationRedisType) => void;
}

const CoordinationRedisTypeSelector: React.FC<CoordinationRedisTypeSelectorProps> = ({ redisType, onTypeChange }) => {
  const { t } = useTranslation("settings");
  const label = (type: CoordinationRedisType) => t(`caching.settings.types.${type}`);
  return <div className="space-y-2">
    <label htmlFor="coordination-redis-type" className="text-sm font-medium">
      {t("caching.settings.redisType")}
    </label>
    <Select value={redisType} onValueChange={(value) => value !== null && onTypeChange(value)}>
      <SelectTrigger id="coordination-redis-type" className="w-full">
        <SelectValue>{label(redisType)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {COORDINATION_REDIS_TYPES.map((type) => (
          <SelectItem key={type} value={type}>
            {label(type)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <p className="text-xs text-muted-foreground">
      {t(`caching.settings.typeDescriptions.${redisType}`, {
        defaultValue: COORDINATION_REDIS_TYPE_DESCRIPTIONS[redisType],
      })}
    </p>
  </div>
};

export default CoordinationRedisTypeSelector;
