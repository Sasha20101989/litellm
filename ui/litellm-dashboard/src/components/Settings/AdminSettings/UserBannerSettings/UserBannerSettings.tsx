"use client";

import React, { useState } from "react";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useUpdateUserBanner } from "@/app/(dashboard)/hooks/userBanner/useUpdateUserBanner";
import { useUserBanner } from "@/app/(dashboard)/hooks/userBanner/useUserBanner";
import NotificationManager from "@/components/molecules/notifications_manager";
import { UserBanner, UserBannerSeverity, UserBannerUpdate } from "@/components/networking";
import { Alert, AlertDescription } from "@/components/shared/Alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SEVERITY_ICONS, UserBannerMarkdown } from "@/components/UserBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

const EMPTY_BANNER: UserBanner = { enabled: false, message: "", severity: "info", revision: "" };

export default function UserBannerSettings() {
  const { accessToken } = useAuthorized();
  const { data: banner, isLoading } = useUserBanner(accessToken);
  const { mutate: saveBanner, isPending } = useUpdateUserBanner(accessToken);
  const persisted = banner ?? EMPTY_BANNER;

  return (
    <UserBannerSettingsForm
      key={JSON.stringify(persisted)}
      persisted={persisted}
      isLoading={isLoading}
      isPending={isPending}
      saveBanner={saveBanner}
    />
  );
}

interface UserBannerSettingsFormProps {
  persisted: UserBanner;
  isLoading: boolean;
  isPending: boolean;
  saveBanner: ReturnType<typeof useUpdateUserBanner>["mutate"];
}

function UserBannerSettingsForm({ persisted, isLoading, isPending, saveBanner }: UserBannerSettingsFormProps) {
  const { t } = useTranslation("settings");
  const [draft, setDraft] = useState<UserBannerUpdate>({
    enabled: persisted.enabled,
    message: persisted.message,
    severity: persisted.severity,
  });

  const messageMissing = draft.enabled && draft.message.trim() === "";

  const handleSave = () => {
    saveBanner(draft, {
      onSuccess: () => {
        NotificationManager.success(t("admin.banner.saved"));
      },
      onError: (error) => {
        NotificationManager.fromBackend(error);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.banner.title")}</CardTitle>
        <CardDescription>
          {t("admin.banner.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={draft.enabled}
                onCheckedChange={(checked: boolean) => setDraft({ ...draft, enabled: checked })}
                aria-label={t("admin.banner.publish")}
              />
              <Label>{t("admin.banner.publish")}</Label>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="user-banner-message">{t("admin.banner.message")}</Label>
              <Textarea
                id="user-banner-message"
                value={draft.message}
                maxLength={4000}
                rows={3}
                placeholder={t("admin.banner.placeholder")}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDraft({ ...draft, message: event.target.value })
                }
              />
              {messageMissing && <p className="text-sm text-destructive">{t("admin.banner.missing")}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("admin.banner.severity")}</Label>
              <Select
                value={draft.severity}
                onValueChange={(value: string | null) =>
                  setDraft({ ...draft, severity: (value ?? "info") as UserBannerSeverity })
                }
              >
                <SelectTrigger className="w-48" aria-label={t("admin.banner.severity")}>
                  <SelectValue placeholder={t("admin.banner.severity")} />
                </SelectTrigger>
                <SelectContent>
                  {(["info", "warning", "error"] as UserBannerSeverity[]).map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity === "info"
                        ? t("admin.banner.severities.info")
                        : severity === "warning"
                          ? t("admin.banner.severities.warning")
                          : t("admin.banner.severities.error")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {draft.message.trim() !== "" && (
              <div className="flex flex-col gap-2">
                <Label>{t("admin.banner.preview")}</Label>
                <Alert variant={draft.severity}>
                  {SEVERITY_ICONS[draft.severity]}
                  <AlertDescription>
                    <UserBannerMarkdown message={draft.message} />
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div>
              <Button onClick={handleSave} disabled={isPending || messageMissing}>
                {isPending ? t("admin.banner.saving") : t("admin.banner.save")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
