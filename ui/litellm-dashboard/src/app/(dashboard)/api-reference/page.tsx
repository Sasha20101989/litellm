"use client";

import APIReferenceView from "./_components/APIReferenceView";
import { DeprecationBanner } from "@/components/DeprecationBanner";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import useProxySettings from "@/app/(dashboard)/hooks/proxySettings/useProxySettings";
import { useTranslation } from "react-i18next";

const APIReferencePage = () => {
  const { t } = useTranslation("management");
  const { accessToken } = useAuthorized();
  const proxySettings = useProxySettings(accessToken);

  return (
    <>
      <DeprecationBanner featureName={t("apiReference.deprecatedFeature")} />
      <APIReferenceView proxySettings={proxySettings} />
    </>
  );
};

export default APIReferencePage;
