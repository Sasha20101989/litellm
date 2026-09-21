"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { OnChangeFn } from "@tanstack/react-table";
import { ArrowLeft, Columns3 } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { FOCUS_FIELDS, type FocusField } from "./FocusVirtualKeysPage";

export function FocusVisibilityMenu({
  visibility,
  onChange,
}: {
  visibility: Record<FocusField, boolean>;
  onChange: OnChangeFn<Record<string, boolean>>;
}) {
  const { t } = useTranslation("gateway");
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Columns3 className="size-4" />
        {t("focusKeys.visibility.action")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("focusKeys.visibility.title")}</DialogTitle>
          <DialogDescription>{t("focusKeys.visibility.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {FOCUS_FIELDS.map((field) => (
            <label key={field} className="flex items-center justify-between gap-4 text-sm">
              <span>{t(`focusKeys.fields.${field}`)}</span>
              <Switch
                checked={visibility[field]}
                onCheckedChange={(checked) => onChange({ ...visibility, [field]: checked })}
                disabled={field === "identity"}
                aria-label={t(`focusKeys.fields.${field}`)}
              />
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FocusSelectedKeyState({
  children,
  error = false,
  onBack,
}: {
  children: React.ReactNode;
  error?: boolean;
  onBack: () => void;
}) {
  const { t } = useTranslation("gateway");
  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center gap-4 text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
    >
      <div className="flex items-center">{children}</div>
      <Button variant="outline" className="lg:hidden" onClick={onBack}>
        <ArrowLeft className="size-4" />
        {t("focusKeys.back")}
      </Button>
    </div>
  );
}
