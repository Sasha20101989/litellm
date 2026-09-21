import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleHelp } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PREDEFINED_INTERVALS = ["7d", "30d", "90d", "180d", "365d"] as const;

interface KeyLifecycleSettingsProps {
  value?: string;
  onChange?: (value: string) => void;
  autoRotationEnabled: boolean;
  onAutoRotationChange: (enabled: boolean) => void;
  rotationInterval: string;
  onRotationIntervalChange: (interval: string) => void;
  isCreateMode?: boolean;
  neverExpire?: boolean;
  onNeverExpireChange?: (checked: boolean) => void;
  id?: string;
}

const hintIcon = (hint: string): React.ReactNode => (
  <Tooltip>
    <TooltipTrigger
      render={<CircleHelp className="size-3.5 shrink-0 cursor-help text-muted-foreground" />}
      aria-label={hint}
    />
    <TooltipContent>{hint}</TooltipContent>
  </Tooltip>
);

const KeyLifecycleSettings: React.FC<KeyLifecycleSettingsProps> = ({
  value,
  onChange,
  autoRotationEnabled,
  onAutoRotationChange,
  rotationInterval,
  onRotationIntervalChange,
  isCreateMode = false,
  neverExpire = false,
  onNeverExpireChange,
  id,
}) => {
  const { t } = useTranslation("gateway");
  const intervalLabels: Record<string, string> = Object.fromEntries([
    ...PREDEFINED_INTERVALS.map((interval) => [
      interval,
      t("virtualKeys.edit.intervalDays", { count: Number.parseInt(interval, 10) }),
    ]),
    ["custom", t("virtualKeys.edit.customInterval")],
  ]);
  const isCustomInterval = Boolean(rotationInterval) && !PREDEFINED_INTERVALS.includes(rotationInterval as never);

  const [showCustomInput, setShowCustomInput] = useState(isCustomInterval);
  const [customInterval, setCustomInterval] = useState(isCustomInterval ? rotationInterval : "");

  const durationId = id ?? "key-lifecycle-duration";

  const handleIntervalChange = (next: string) => {
    if (next === "custom") {
      setShowCustomInput(true);
      return;
    }
    setShowCustomInput(false);
    setCustomInterval("");
    onRotationIntervalChange(next);
  };

  const handleCustomIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInterval(event.target.value);
    onRotationIntervalChange(event.target.value);
  };

  const handleNeverExpireChange = (checked: boolean) => {
    onNeverExpireChange?.(checked);
    if (checked) {
      onChange?.("");
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="space-y-4">
          <span className="text-sm font-medium text-foreground">{t("virtualKeys.edit.expirySettings")}</span>

          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-sm font-medium text-foreground">
              <label htmlFor={durationId}>{t("virtualKeys.edit.expireKey")}</label>
              {hintIcon(t("virtualKeys.edit.expiryHint"))}
              {!isCreateMode && onNeverExpireChange && (
                <span className="ml-2 flex items-center gap-2 text-sm font-normal text-muted-foreground">
                  <Checkbox
                    id={`${durationId}-never-expire`}
                    checked={neverExpire}
                    onCheckedChange={handleNeverExpireChange}
                  />
                  <label htmlFor={`${durationId}-never-expire`} className="cursor-pointer">
                    {t("virtualKeys.edit.neverExpire")}
                  </label>
                </span>
              )}
            </div>
            <Input
              id={durationId}
              value={value ?? ""}
              onChange={(event) => onChange?.(event.target.value)}
              placeholder={
                isCreateMode ? t("virtualKeys.edit.createExpiryPlaceholder") : t("virtualKeys.edit.expiryPlaceholder")
              }
              className="w-full"
              disabled={!isCreateMode && neverExpire}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <span className="text-sm font-medium text-foreground">{t("virtualKeys.edit.rotationSettings")}</span>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center space-x-1 text-sm font-medium text-foreground">
                <span>{t("virtualKeys.edit.enableRotation")}</span>
                {hintIcon(t("virtualKeys.edit.rotationHint"))}
              </label>
              <Switch checked={autoRotationEnabled} onCheckedChange={onAutoRotationChange} />
            </div>

            {autoRotationEnabled && (
              <div className="space-y-2">
                <label className="flex items-center space-x-1 text-sm font-medium text-foreground">
                  <span>{t("virtualKeys.edit.rotationInterval")}</span>
                  {hintIcon(t("virtualKeys.edit.rotationIntervalHint"))}
                </label>
                <div className="space-y-2">
                  <Select
                    value={showCustomInput ? "custom" : rotationInterval || null}
                    onValueChange={(next: string | null) => next !== null && handleIntervalChange(next)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("virtualKeys.edit.selectInterval")}>
                        {(selected: string | null) =>
                          selected === null ? (
                            t("virtualKeys.edit.selectInterval")
                          ) : (
                            <span title={intervalLabels[selected] ?? selected}>
                              {intervalLabels[selected] ?? selected}
                            </span>
                          )
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_INTERVALS.map((interval) => (
                        <SelectItem key={interval} value={interval} title={intervalLabels[interval]}>
                          {intervalLabels[interval]}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom" title={intervalLabels.custom}>
                        {intervalLabels.custom}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {showCustomInput && (
                    <div className="space-y-1">
                      <Input
                        value={customInterval}
                        onChange={handleCustomIntervalChange}
                        placeholder={t("virtualKeys.edit.rotationPlaceholder")}
                      />
                      <div className="text-xs text-muted-foreground">{t("virtualKeys.edit.rotationFormats")}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {autoRotationEnabled && (
            <div className="rounded-md bg-info/10 p-3 text-sm text-info">{t("virtualKeys.edit.rotationNotice")}</div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default KeyLifecycleSettings;
