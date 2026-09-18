import { useTranslation } from "react-i18next";
import React from "react";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shared/Alert";
import { buttonVariants } from "@/components/ui/button";
import { getLoginUrl } from "@/utils/returnUrlUtils";

export function OnboardingErrorView() {
  const { t } = useTranslation("auth");
  return (
    <div className="mx-auto w-full max-w-md mt-10">
      <Alert variant="error">
        <CircleAlert />
        <AlertTitle>{t("onboarding.loadErrorTitle")}</AlertTitle>
        <AlertDescription>{t("onboarding.loadErrorDescription")}</AlertDescription>
      </Alert>
      <div className="mt-4">
        <a href={getLoginUrl()} className={buttonVariants({ variant: "outline" })}>
          {t("onboarding.backToLogin")}
        </a>
      </div>
    </div>
  );
}
