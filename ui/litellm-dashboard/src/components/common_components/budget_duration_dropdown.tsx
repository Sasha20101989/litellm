import React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const NEVER_RESETS_BUDGET_DURATION = "none";

interface BudgetDurationDropdownProps {
  id?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  showNeverResets?: boolean;
}

const BudgetDurationDropdown: React.FC<BudgetDurationDropdownProps> = ({
  id,
  value,
  onChange,
  className = "",
  style = {},
  placeholder,
  showNeverResets = false,
}) => {
  const { t } = useTranslation("gateway");
  const resolvedPlaceholder = placeholder ?? t("virtualKeys.edit.notSet");
  const durationLabels: Record<string, string> = {
    [NEVER_RESETS_BUDGET_DURATION]: t("virtualKeys.edit.neverResets"),
    "1h": t("virtualKeys.edit.hourly"),
    "24h": t("virtualKeys.edit.daily"),
    "7d": t("virtualKeys.edit.weekly"),
    "30d": t("virtualKeys.edit.monthly"),
  };
  return (
    <Select items={durationLabels} value={value || null} onValueChange={onChange}>
      <SelectTrigger id={id} className={`w-full ${className}`} style={style}>
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>{resolvedPlaceholder}</SelectItem>
        {Object.entries(durationLabels)
          .filter(([duration]) => showNeverResets || duration !== NEVER_RESETS_BUDGET_DURATION)
          .map(([duration, label]) => (
            <SelectItem key={duration} value={duration}>
              {label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};

export const getBudgetDurationLabel = (value: string | null | undefined): string => {
  if (!value) return "Not set";

  const budgetDurationMap: Record<string, string> = {
    "1h": "hourly",
    "24h": "daily",
    "7d": "weekly",
    "30d": "monthly",
  };

  return budgetDurationMap[value] || value;
};

export default BudgetDurationDropdown;
