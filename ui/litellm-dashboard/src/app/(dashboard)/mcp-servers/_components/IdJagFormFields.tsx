import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { SimpleTooltip } from "@/components/ui/tooltip";

import { MountedFormField } from "@/components/common_components/MountedFormField";
import UpstreamTokenHeaderField from "./UpstreamTokenHeaderField";
import { requiredRule } from "@/components/common_components/formRules";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requiredUnlessSiblingSet, tagsControl, textControl } from "./mcpFieldRules";

interface IdJagFormFieldsProps {
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

const PRIVATE_KEY_PATH = ["credentials", "client_private_key"] as const;

const IdJagFormFields: React.FC<IdJagFormFieldsProps> = ({ isEditing = false }) => {
  const { t } = useTranslation("gateway");
  const placeholderSuffix = isEditing ? t("mcpServers.forms.common.keepExisting") : "";
  const requiredWhenCreating = (message: string) =>
    isEditing ? undefined : { validate: { required: requiredRule(message) } };

  return (
    <>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.orgEndpoint")}
            tooltip={t("mcpServers.forms.idJag.orgEndpointTooltip")}
          />
        }
        name="token_exchange_endpoint"
        required={!isEditing}
        rules={requiredWhenCreating(t("mcpServers.forms.idJag.orgEndpointRequired"))}
      >
        {(control) => (
          <Input
            {...textControl(control)}
            placeholder={t("mcpServers.forms.idJag.orgEndpointPlaceholder")}
            className={fieldClassName}
          />
        )}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.resourceEndpoint")}
            tooltip={t("mcpServers.forms.idJag.resourceEndpointTooltip")}
          />
        }
        name={["credentials", "id_jag_resource_token_endpoint"]}
        required={!isEditing}
        rules={requiredWhenCreating(t("mcpServers.forms.idJag.resourceEndpointRequired"))}
      >
        {(control) => (
          <Input
            {...textControl(control)}
            placeholder={t("mcpServers.forms.idJag.resourceEndpointPlaceholder")}
            className={fieldClassName}
          />
        )}
      </MountedFormField>
      <MountedFormField
        label={<FieldLabel label={t("mcpServers.forms.idJag.clientId")} tooltip={t("mcpServers.forms.idJag.clientIdTooltip")} />}
        name={["credentials", "client_id"]}
        required={!isEditing}
        rules={requiredWhenCreating(t("mcpServers.forms.idJag.clientIdRequired"))}
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
            label={t("mcpServers.forms.idJag.clientSecret")}
            tooltip={t("mcpServers.forms.idJag.clientSecretTooltip")}
          />
        }
        name={["credentials", "client_secret"]}
        rules={
          isEditing
            ? undefined
            : {
                deps: ["credentials.client_private_key"],
                validate: {
                  secretOrPrivateKey: requiredUnlessSiblingSet(
                    PRIVATE_KEY_PATH,
                    t("mcpServers.forms.idJag.credentialRequired"),
                  ),
                },
              }
        }
      >
        {(control) => (
          <PasswordInput
            {...textControl(control)}
            placeholder={t("mcpServers.forms.tokenExchange.clientSecretPlaceholder", { suffix: placeholderSuffix })}
            groupClassName={fieldClassName}
          />
        )}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.privateKey")}
            tooltip={t("mcpServers.forms.idJag.privateKeyTooltip")}
          />
        }
        name={PRIVATE_KEY_PATH}
      >
        {(control) => (
          <Textarea
            {...textControl(control)}
            rows={3}
            placeholder={`-----BEGIN PRIVATE KEY-----${placeholderSuffix}`}
            className={fieldClassName}
          />
        )}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.privateKeyId")}
            tooltip={t("mcpServers.forms.idJag.privateKeyIdTooltip")}
          />
        }
        name={["credentials", "client_private_key_id"]}
      >
        {(control) => <Input {...textControl(control)} placeholder={t("mcpServers.forms.idJag.privateKeyIdPlaceholder")} className={fieldClassName} />}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.signingAlgorithm")}
            tooltip={t("mcpServers.forms.idJag.signingAlgorithmTooltip")}
          />
        }
        name={["credentials", "client_assertion_signing_alg"]}
      >
        {(control) => <Input {...textControl(control)} placeholder={t("mcpServers.forms.idJag.signingAlgorithmPlaceholder")} className={fieldClassName} />}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.audience")}
            tooltip={t("mcpServers.forms.idJag.audienceTooltip")}
          />
        }
        name="audience"
      >
        {(control) => (
          <Input {...textControl(control)} placeholder={t("mcpServers.forms.idJag.audiencePlaceholder")} className={fieldClassName} />
        )}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.resource")}
            tooltip={t("mcpServers.forms.idJag.resourceTooltip")}
          />
        }
        name={["credentials", "id_jag_resource"]}
      >
        {(control) => (
          <Input {...textControl(control)} placeholder={t("mcpServers.forms.idJag.resourcePlaceholder")} className={fieldClassName} />
        )}
      </MountedFormField>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.subjectType")}
            tooltip={t("mcpServers.forms.idJag.subjectTypeTooltip")}
          />
        }
        name="subject_token_type"
      >
        {(control) => (
          <Input
            {...textControl(control)}
                placeholder={t("mcpServers.forms.idJag.subjectTypePlaceholder")}
            className={fieldClassName}
          />
        )}
      </MountedFormField>
      <MountedFormField
        label={<FieldLabel label={t("mcpServers.forms.idJag.scopes")} tooltip={t("mcpServers.forms.idJag.scopesTooltip")} />}
        name={["credentials", "scopes"]}
      >
        {(control) => <MultiSelect {...tagsControl(control)} placeholder={t("mcpServers.forms.common.addScopes")} className="rounded-lg" />}
      </MountedFormField>
      <UpstreamTokenHeaderField />
    </>
  );
};

export default IdJagFormFields;
