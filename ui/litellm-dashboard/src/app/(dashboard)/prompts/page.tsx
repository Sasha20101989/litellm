"use client";

import PromptsPanel from "./_components";
import { DeprecationBanner } from "@/components/DeprecationBanner";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useTranslation } from "react-i18next";

export default function Prompts() {
  const { t } = useTranslation("prompts");
  const { accessToken, userRole } = useAuthorized();
  return (
    <>
      <DeprecationBanner featureName={t("featureName")} />
      <PromptsPanel accessToken={accessToken} userRole={userRole} />
    </>
  );
}
