"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import NumericalInput from "@/components/shared/numerical_input";
import { CircleHelp, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export type FocusCacheControlRole = "user" | "system" | "assistant";

export interface FocusCacheControlInjectionPoint {
  location: "message";
  role?: FocusCacheControlRole;
  index?: string | number;
}

interface FocusCacheControlInjectionPointsProps {
  value?: FocusCacheControlInjectionPoint[];
  onChange?: (points: FocusCacheControlInjectionPoint[]) => void;
}

function LabelWithHint({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center">
      <Label>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={`${label}: ${hint}`}
                className="ml-1 inline-flex cursor-help items-center rounded-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <CircleHelp aria-hidden className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs whitespace-normal">{hint}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function FocusCacheControlInjectionPoints({ value, onChange }: FocusCacheControlInjectionPointsProps) {
  const { t } = useTranslation("gateway");
  const points = value ?? [];
  const locationItems = [{ value: "message", label: t("models.editor.cache.message") }];
  const roleItems = [
    { value: "user", label: t("models.editor.cache.roles.user") },
    { value: "system", label: t("models.editor.cache.roles.system") },
    { value: "assistant", label: t("models.editor.cache.roles.assistant") },
  ];
  const replaceAt = (index: number, point: FocusCacheControlInjectionPoint) =>
    onChange?.(points.map((existing, position) => (position === index ? point : existing)));

  return (
    <div className="ml-4 border-l-2 border-border pl-4">
      <p className="mb-4 text-sm text-muted-foreground">{t("models.editor.cache.description")}</p>
      {points.map((point, index) => (
        <div key={index} className="mb-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <div className="space-y-1">
            <Label>{t("models.editor.cache.type")}</Label>
            <Select items={locationItems} value={point.location} disabled>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locationItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <LabelWithHint label={t("models.editor.cache.role")} hint={t("models.editor.cache.roleHint")} />
            <Select
              items={roleItems}
              value={point.role ?? null}
              onValueChange={(selected) =>
                replaceAt(index, { ...point, role: (selected as FocusCacheControlRole | null) ?? undefined })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("models.editor.cache.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>{t("models.editor.none")}</SelectItem>
                {roleItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <LabelWithHint label={t("models.editor.cache.index")} hint={t("models.editor.cache.indexHint")} />
            <NumericalInput
              type="number"
              placeholder={t("models.editor.optional")}
              step={1}
              value={point.index ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                replaceAt(index, { ...point, index: event.target.value === "" ? undefined : event.target.value })
              }
            />
          </div>
          {points.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("models.editor.cache.removePoint", { number: index + 1 })}
              className="text-destructive"
              onClick={() => onChange?.(points.filter((_, position) => position !== index))}
            >
              <Minus className="size-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={() => onChange?.([...points, { location: "message" }])}
      >
        <Plus className="mr-2 size-4" />
        {t("models.editor.cache.addPoint")}
      </Button>
    </div>
  );
}
