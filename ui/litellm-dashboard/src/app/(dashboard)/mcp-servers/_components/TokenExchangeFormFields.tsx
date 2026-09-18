import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useWatch } from "react-hook-form";

import { MountedFormField } from "@/components/common_components/MountedFormField";
import UpstreamTokenHeaderField from "./UpstreamTokenHeaderField";
import { requiredRule } from "@/components/common_components/formRules";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Input } from "@/components/ui/input";
import { selectControl, selectTriggerControl, tagsControl, textControl } from "./mcpFieldRules";

interface TokenExchangeFormFieldsProps {
  isEditing?: boolean;
}

const fieldClassName = "rounded-lg border-border focus:border-info focus:ring-ring";

const FieldLabel: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => (
  <span className="text-sm font-medium text-foreground flex items-center">
    {label}
    <SimpleTooltip content={tooltip}>
      <Info className="ml-2 size-4 text-info hover:text-info/80 cursor-help" />
    </SimpleTooltip>
  </span>
);

const TokenExchangeFormFields: React.FC<TokenExchangeFormFieldsProps> = ({ isEditing = false }) => {
  const { t } = useTranslation("gateway");
  const placeholderSuffix = isEditing ? t("mcpServers.forms.common.keepExisting") : "";
  const isEntraObo = useWatch({ name: "token_exchange_profile" }) === "entra_obo";
  const requiredWhenCreating = (message: string) =>
    isEditing ? undefined : { validate: { required: requiredRule(message) } };
  const profileItems = [
    { value: "rfc8693", label: t("mcpServers.forms.tokenExchange.rfc") },
    { value: "entra_obo", label: t("mcpServers.forms.tokenExchange.entra") },
  ];

  return (
    <>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.tokenExchange.profile")}
            tooltip={t("mcpServers.forms.tokenExchange.profileTooltip")}
          />
        }
        name="token_exchange_profile"
        {...(isEditing ? {} : { defaultValue: "rfc8693" })}
      >
        {(control) => (
          <Select {...selectControl<string>(control)} items={profileItems}>
            <SelectTrigger {...selectTriggerControl(control)} className="w-full rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {profileItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  <span className="font-medium">{item.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.tokenExchange.endpoint")}
            tooltip={t("mcpServers.forms.tokenExchange.endpointTooltip")}
          />
        }
        name="token_exchange_endpoint"
      >
        {(control) => (
          <Input
            {...textControl(control)}
            placeholder={t("mcpServers.forms.tokenExchange.endpointPlaceholder")}
            className={fieldClassName}
          />
        )}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.tokenExchange.clientId")}
            tooltip={t("mcpServers.forms.tokenExchange.clientIdTooltip")}
          />
        }
        name={["credentials", "client_id"]}
        required={!isEditing}
        rules={requiredWhenCreating(t("mcpServers.forms.tokenExchange.clientIdRequired"))}
      >
        {(control) => (
          <PasswordInput
            {...textControl(control)}
            placeholder={t("mcpServers.forms.tokenExchange.clientIdPlaceholder", { suffix: placeholderSuffix })}
            groupClassName={fieldClassName}
          />
        )}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.tokenExchange.clientSecret")}
            tooltip={t("mcpServers.forms.tokenExchange.clientSecretTooltip")}
          />
        }
        name={["credentials", "client_secret"]}
        required={!isEditing}
        rules={requiredWhenCreating(t("mcpServers.forms.tokenExchange.clientSecretRequired"))}
      >
        {(control) => (
          <PasswordInput
            {...textControl(control)}
            placeholder={t("mcpServers.forms.tokenExchange.clientSecretPlaceholder", { suffix: placeholderSuffix })}
            groupClassName={fieldClassName}
          />
        )}
      </MountedFormField>
      {!isEntraObo && (
        <>
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.forms.tokenExchange.audience")}
                tooltip={t("mcpServers.forms.tokenExchange.audienceTooltip")}
              />
            }
            name="audience"
          >
            {(control) => (
              <Input {...textControl(control)} placeholder={t("mcpServers.forms.tokenExchange.audiencePlaceholder")} className={fieldClassName} />
            )}
          </MountedFormField>
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.forms.tokenExchange.subjectType")}
                tooltip={t("mcpServers.forms.tokenExchange.subjectTypeTooltip")}
              />
            }
            name="subject_token_type"
          >
            {(control) => (
              <Input
                {...textControl(control)}
                placeholder={t("mcpServers.forms.tokenExchange.subjectTypePlaceholder")}
                className={fieldClassName}
              />
            )}
          </MountedFormField>
        </>
      )}
      <MountedFormField
        label={
          <FieldLabel
            label={t(isEntraObo ? "mcpServers.forms.tokenExchange.scopes" : "mcpServers.forms.tokenExchange.scopesOptional")}
            tooltip={
              isEntraObo
                ? t("mcpServers.forms.tokenExchange.entraScopesTooltip")
                : t("mcpServers.forms.tokenExchange.scopesTooltip")
            }
          />
        }
        name={["credentials", "scopes"]}
        required={isEntraObo}
        rules={
          isEntraObo
            ? {
                validate: {
                  required: requiredRule(t("mcpServers.forms.tokenExchange.entraScopeRequired")),
                },
              }
            : undefined
        }
      >
        {(control) => (
          <MultiSelect
            {...tagsControl(control)}
            placeholder={isEntraObo ? "api://<app-id>/.default" : t("mcpServers.forms.common.addScopes")}
            className="rounded-lg"
          />
        )}
      </MountedFormField>
      <UpstreamTokenHeaderField />
    </>
  );
};

export default TokenExchangeFormFields;
