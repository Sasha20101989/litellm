import React from "react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/shared/table_cells";
import { RefreshIcon, ClockIcon } from "@heroicons/react/outline";

interface AutoRotationViewProps {
  autoRotate?: boolean;
  rotationInterval?: string;
  lastRotationAt?: string;
  keyRotationAt?: string;
  nextRotationAt?: string;
  variant?: "card" | "inline";
  className?: string;
}

const AutoRotationView: React.FC<AutoRotationViewProps> = ({
  autoRotate = false,
  rotationInterval,
  lastRotationAt,
  keyRotationAt,
  nextRotationAt,
  variant = "card",
  className = "",
}) => {
  const { t, i18n } = useTranslation("gateway");
  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",

      hour: "numeric",
      minute: "2-digit",
    });
  };

  const content = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <RefreshIcon className="h-4 w-4 text-info" />
          <p className="text-sm font-semibold text-foreground">{t("virtualKeys.sharedDetails.rotationTitle")}</p>
          <StatusBadge
            tone={autoRotate ? "success" : "neutral"}
            label={autoRotate ? t("virtualKeys.sharedDetails.enabled") : t("virtualKeys.sharedDetails.disabled")}
          />
          {autoRotate && rotationInterval && (
            <>
              <p className="text-sm text-muted-foreground">•</p>
              <p className="text-sm text-muted-foreground">
                {t("virtualKeys.sharedDetails.everyInterval", { interval: rotationInterval })}
              </p>
            </>
          )}
        </div>
      </div>

      {(autoRotate || lastRotationAt || keyRotationAt || nextRotationAt) && (
        <div className="space-y-3">
          {lastRotationAt && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-3">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t("virtualKeys.sharedDetails.lastRotation")}</p>
                <p className="text-sm text-muted-foreground">{formatTimestamp(lastRotationAt)}</p>
              </div>
            </div>
          )}

          {(keyRotationAt || nextRotationAt) && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-3">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t("virtualKeys.sharedDetails.nextRotation")}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTimestamp(nextRotationAt || keyRotationAt || "")}
                </p>
              </div>
            </div>
          )}

          {autoRotate && !lastRotationAt && !keyRotationAt && !nextRotationAt && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-3">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("virtualKeys.sharedDetails.noRotationHistory")}</p>
            </div>
          )}
        </div>
      )}

      {!autoRotate && !lastRotationAt && !keyRotationAt && !nextRotationAt && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-3">
          <RefreshIcon className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("virtualKeys.sharedDetails.rotationDisabled")}</p>
        </div>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <div className={`rounded-lg border border-border bg-card p-6 ${className}`}>
        <div className="mb-6 flex items-center gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("virtualKeys.sharedDetails.rotationTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("virtualKeys.sharedDetails.rotationDescription")}</p>
          </div>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <p className="mb-3 text-sm font-medium text-foreground">{t("virtualKeys.sharedDetails.rotationTitle")}</p>
      {content}
    </div>
  );
};

export default AutoRotationView;
