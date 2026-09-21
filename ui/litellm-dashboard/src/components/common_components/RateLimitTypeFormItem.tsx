import React from "react";
import { useTranslation } from "react-i18next";
import { CircleHelp } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type RateLimitType = "tpm" | "rpm";

interface RateLimitTypeOption {
  value: string;
  label: string;
  description: string;
}

interface RateLimitTypeFormItemProps {
  /** The type of rate limit - either 'tpm' or 'rpm' */
  type: RateLimitType;
  /** The form field name */
  name: string;
  /** Whether to show detailed descriptions (default: true) */
  showDetailedDescriptions?: boolean;
  /** Additional CSS classes */
  className?: string;
  value?: string | null;
  /** Custom onChange handler */
  onChange?: (value: string) => void;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: true | undefined;
  "aria-describedby"?: string | undefined;
}

export const RateLimitTypeFormItem: React.FC<RateLimitTypeFormItemProps> = ({
  type,
  name,
  showDetailedDescriptions = true,
  className = "",
  value,
  onChange,
  id,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}) => {
  const { t } = useTranslation("gateway");
  const upper = type.toUpperCase();
  const plainLabels: Record<string, string> = {
    best_effort_throughput: t("virtualKeys.edit.bestEffort"),
    guaranteed_throughput: t("virtualKeys.edit.guaranteedThroughput"),
    dynamic: t("virtualKeys.edit.dynamicLimit"),
  };
  const options: RateLimitTypeOption[] = [
    {
      value: "best_effort_throughput",
      label: t("virtualKeys.edit.defaultLimit"),
      description: t("virtualKeys.edit.bestEffortDescription", { unit: upper }),
    },
    {
      value: "guaranteed_throughput",
      label: plainLabels.guaranteed_throughput,
      description: t("virtualKeys.edit.guaranteedDescription", { unit: upper }),
    },
    {
      value: "dynamic",
      label: plainLabels.dynamic,
      description: t("virtualKeys.edit.dynamicDescription", { unit: upper }),
    },
  ];
  const tooltip = t("virtualKeys.edit.rateLimitTypeHint", { unit: upper });
  const controlId = id ?? `rate-limit-type-${name}`;

  return (
    <div className={className}>
      <TooltipProvider>
        <label htmlFor={controlId} className="mb-2 flex items-center gap-1 text-sm text-foreground">
          {t("virtualKeys.edit.rateLimitType", { unit: upper })}
          <Tooltip>
            <TooltipTrigger
              render={<CircleHelp className="size-3.5 shrink-0 cursor-help text-muted-foreground" />}
              aria-label={tooltip}
            />
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </label>
      </TooltipProvider>
      <Select
        value={value ?? null}
        onValueChange={(next: string | null) => next !== null && onChange?.(next)}
        disabled={disabled}
      >
        <SelectTrigger id={controlId} className="w-full" aria-invalid={ariaInvalid} aria-describedby={ariaDescribedBy}>
          <SelectValue placeholder={t("virtualKeys.edit.selectRateLimitType")}>
            {(selected: string | null) =>
              selected === null ? t("virtualKeys.edit.selectRateLimitType") : plainLabels[selected] ?? selected
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) =>
            showDetailedDescriptions ? (
              <SelectItem key={option.value} value={option.value} title={option.label}>
                <span className="flex flex-col py-1">
                  <span className="font-medium">{option.label}</span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">{option.description}</span>
                </span>
              </SelectItem>
            ) : (
              <SelectItem key={option.value} value={option.value} title={plainLabels[option.value]}>
                {plainLabels[option.value]}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RateLimitTypeFormItem;
