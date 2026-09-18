import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { SimpleTooltip } from "@/components/ui/tooltip";

import { MountedFormField } from "@/components/common_components/MountedFormField";
import { requiredRule } from "@/components/common_components/formRules";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Input } from "@/components/ui/input";
import { requiredWhenSiblingSet, textControl } from "./mcpFieldRules";

const fieldClassName = "rounded-lg border-border focus:border-info focus:ring-ring";

const FieldLabel: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => (
  <span className="text-sm font-medium text-foreground flex items-center">
    {label}
    <SimpleTooltip content={tooltip}>
      <Info className="ml-2 size-4 text-info hover:text-info/80 cursor-help" />
    </SimpleTooltip>
  </span>
);

const ACCESS_KEY_PATH = ["credentials", "aws_access_key_id"] as const;
const SECRET_KEY_PATH = ["credentials", "aws_secret_access_key"] as const;

const AwsSigV4Fields: React.FC = () => {
  const { t } = useTranslation("gateway");

  return (
    <>
    <p className="text-sm text-muted-foreground mb-2">
      {t("mcpServers.edit.awsDescription")}{" "}
      <a
        href="https://docs.litellm.ai/docs/mcp_aws_sigv4"
        target="_blank"
        rel="noopener noreferrer"
        className="text-info hover:text-info/80"
      >
        {t("mcpServers.edit.docs")}
      </a>
    </p>
    <MountedFormField
      label={<FieldLabel label={t("mcpServers.edit.awsRegion")} tooltip={t("mcpServers.edit.awsRegionHint")} />}
      name={["credentials", "aws_region_name"]}
      required
      rules={{ validate: { required: requiredRule(t("mcpServers.forms.aws.regionRequired")) } }}
    >
      {(control) => <Input {...textControl(control)} placeholder={t("mcpServers.forms.aws.regionPlaceholder")} className={fieldClassName} />}
    </MountedFormField>
    <MountedFormField
      label={
        <FieldLabel
          label={t("mcpServers.edit.awsService")}
          tooltip={t("mcpServers.edit.awsServiceHint")}
        />
      }
      name={["credentials", "aws_service_name"]}
    >
      {(control) => <Input {...textControl(control)} placeholder={t("mcpServers.forms.aws.servicePlaceholder")} className={fieldClassName} />}
    </MountedFormField>
    <MountedFormField
      label={
        <FieldLabel
          label={t("mcpServers.edit.awsAccessKey")}
          tooltip={t("mcpServers.edit.awsAccessKeyHint")}
        />
      }
      name={ACCESS_KEY_PATH}
      rules={{
        deps: ["credentials.aws_secret_access_key"],
        validate: {
          pairedWithSecret: requiredWhenSiblingSet(
            SECRET_KEY_PATH,
            t("mcpServers.forms.aws.accessKeyRequired"),
          ),
        },
      }}
    >
      {(control) => (
        <PasswordInput
          {...textControl(control)}
          placeholder={t("mcpServers.forms.aws.accessKeyPlaceholder")}
          groupClassName={fieldClassName}
        />
      )}
    </MountedFormField>
    <MountedFormField
      label={
        <FieldLabel label={t("mcpServers.edit.awsSecret")} tooltip={t("mcpServers.edit.awsSecretHint")} />
      }
      name={SECRET_KEY_PATH}
      rules={{
        deps: ["credentials.aws_access_key_id"],
        validate: {
          pairedWithAccessKey: requiredWhenSiblingSet(
            ACCESS_KEY_PATH,
            t("mcpServers.forms.aws.secretRequired"),
          ),
        },
      }}
    >
      {(control) => (
        <PasswordInput
          {...textControl(control)}
          placeholder={t("mcpServers.forms.aws.secretPlaceholder")}
          groupClassName={fieldClassName}
        />
      )}
    </MountedFormField>
    <MountedFormField
      label={<FieldLabel label={t("mcpServers.edit.awsSessionToken")} tooltip={t("mcpServers.edit.awsSessionTokenHint")} />}
      name={["credentials", "aws_session_token"]}
    >
      {(control) => (
        <PasswordInput
          {...textControl(control)}
          placeholder={t("mcpServers.forms.aws.sessionTokenPlaceholder")}
          groupClassName={fieldClassName}
        />
      )}
    </MountedFormField>
    <MountedFormField
      label={
        <FieldLabel
          label={t("mcpServers.edit.awsRoleArn")}
          tooltip={t("mcpServers.edit.awsRoleArnHint")}
        />
      }
      name={["credentials", "aws_role_name"]}
    >
      {(control) => (
        <Input
          {...textControl(control)}
          placeholder={t("mcpServers.forms.aws.rolePlaceholder")}
          className={fieldClassName}
        />
      )}
    </MountedFormField>
    <MountedFormField
      label={
        <FieldLabel
          label={t("mcpServers.edit.awsSessionName")}
          tooltip={t("mcpServers.edit.awsSessionNameHint")}
        />
      }
      name={["credentials", "aws_session_name"]}
    >
      {(control) => (
        <Input
          {...textControl(control)}
          placeholder={t("mcpServers.forms.aws.sessionNamePlaceholder")}
          className={fieldClassName}
        />
      )}
    </MountedFormField>
    </>
  );
};

export default AwsSigV4Fields;
