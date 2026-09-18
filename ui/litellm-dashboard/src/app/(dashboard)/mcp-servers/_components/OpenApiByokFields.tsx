import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MountedFormField } from "@/components/common_components/MountedFormField";
import { switchControl, tagsControl, textControl } from "./mcpFieldRules";

const AUTH_HEADER_FORMATS: Readonly<Record<string, string>> = {
  bearer_token: "Authorization: Bearer {key}",
  token: "Authorization: token {key}",
  api_key: "x-api-key: {key}",
  basic: "Authorization: Basic {key}",
  authorization: "Authorization: {key}",
};

const OpenApiByokFields: React.FC = () => {
  const { t } = useTranslation("gateway");
  const isByok = Boolean(useWatch({ name: "is_byok" }));
  const authType = useWatch({ name: "auth_type" }) as string | undefined;
  const hasAuthType = Boolean(authType) && authType !== "none";

  return (
    <>
      <MountedFormField
        label={
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            {t("mcpServers.forms.byok.title")}
            <SimpleTooltip content={t("mcpServers.forms.byok.tooltip")}>
              <Info className="size-4 text-info hover:text-info/80 cursor-help" />
            </SimpleTooltip>
          </span>
        }
        name="is_byok"
      >
        {(control) => <Switch {...switchControl(control)} />}
      </MountedFormField>

      {isByok && (
        <>
          {hasAuthType && (
            <div className="mb-4 p-3 bg-info/10 rounded-lg text-sm text-info flex items-start gap-2">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span>
                {t("mcpServers.forms.byok.sentAs")}{" "}
                <code className="font-mono bg-info/15 px-1 rounded-sm">
                  {authType === undefined ? "" : AUTH_HEADER_FORMATS[authType]}
                </code>
              </span>
            </div>
          )}
          {!authType && (
            <div className="mb-4 p-3 bg-warning/10 rounded-lg text-sm text-warning flex items-start gap-2">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span>
                {t("mcpServers.forms.byok.selectAuth")}
              </span>
            </div>
          )}
          <MountedFormField
            label={
              <span className="text-sm font-medium text-foreground">
                {t("mcpServers.forms.byok.accessDescription")}
                <SimpleTooltip content={t("mcpServers.forms.byok.accessDescriptionTooltip")}>
                  <Info className="ml-2 size-4 text-info hover:text-info/80 cursor-help" />
                </SimpleTooltip>
              </span>
            }
            name="byok_description"
          >
            {(control) => (
              <MultiSelect
                {...tagsControl(control)}
                placeholder={t("mcpServers.forms.byok.accessDescriptionPlaceholder")}
                className="w-full"
              />
            )}
          </MountedFormField>

          <MountedFormField
            label={
              <span className="text-sm font-medium text-foreground">
                {t("mcpServers.forms.byok.helpUrl")}
                <SimpleTooltip content={t("mcpServers.forms.byok.helpUrlTooltip")}>
                  <Info className="ml-2 size-4 text-info hover:text-info/80 cursor-help" />
                </SimpleTooltip>
              </span>
            }
            name="byok_api_key_help_url"
          >
            {(control) => <Input {...textControl(control)} placeholder={t("mcpServers.forms.byok.helpUrlPlaceholder")} />}
          </MountedFormField>
        </>
      )}
    </>
  );
};

export default OpenApiByokFields;
