import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OAUTH_FLOW } from "@/components/mcp_tools/types";
import { MountedFormField } from "@/components/common_components/MountedFormField";
import { requiredRule } from "@/components/common_components/formRules";
import TokenEndpointAuthMethodField from "./TokenEndpointAuthMethodField";
import UpstreamTokenHeaderField from "./UpstreamTokenHeaderField";
import {
  numberControl,
  parsesAsJson,
  selectControl,
  selectTriggerControl,
  tagsControl,
  textControl,
} from "./mcpFieldRules";

interface OAuthFlowStatus {
  startOAuthFlow: () => void;
  status: string;
  error: string | null;
  tokenResponse: { access_token?: string; expires_in?: number } | null;
}

interface OAuthFormFieldsProps {
  isM2M: boolean;
  isEditing?: boolean;
  oauthFlow?: OAuthFlowStatus;
  initialFlowType?: string;
  /** Link to provider docs for creating an OAuth app (e.g. GitHub). */
  docsUrl?: string | null;
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

const UpstreamResourceField: React.FC = () => {
  const { t } = useTranslation("gateway");
  return (
    <MountedFormField
      label={<FieldLabel label={t("mcpServers.auth.oauth.resource")} tooltip={t("mcpServers.auth.oauth.resourceTooltip")} />}
      name={["credentials", "upstream_resource"]}
    >
      {(control) => (
        <Input {...textControl(control)} placeholder={t("mcpServers.auth.oauth.resourcePlaceholder")} className={fieldClassName} />
      )}
    </MountedFormField>
  );
};

const OAuthFormFields: React.FC<OAuthFormFieldsProps> = ({
  isM2M,
  isEditing = false,
  oauthFlow,
  initialFlowType,
  docsUrl,
}) => {
  const { t } = useTranslation("gateway");
  const placeholderSuffix = isEditing ? t("mcpServers.auth.keepExisting") : "";
  const oauthFlowItems = [
    { value: OAUTH_FLOW.M2M, label: t("mcpServers.auth.oauth.m2m") },
    { value: OAUTH_FLOW.INTERACTIVE, label: t("mcpServers.auth.oauth.interactive") },
  ];
  const requiredWhenCreating = (message: string) =>
    isEditing ? undefined : { validate: { required: requiredRule(message) } };

  return (
    <>
      <MountedFormField
        label={
          <FieldLabel
            label={t("mcpServers.auth.oauth.flowType")}
            tooltip={t("mcpServers.auth.oauth.flowTypeTooltip")}
          />
        }
        name="oauth_flow_type"
        {...(initialFlowType ? { defaultValue: initialFlowType } : {})}
      >
        {(control) => (
          <Select {...selectControl<string>(control)} items={oauthFlowItems}>
            <SelectTrigger {...selectTriggerControl(control)} className="w-full rounded-lg">
              <SelectValue placeholder={t("mcpServers.auth.oauth.selectFlow")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={OAUTH_FLOW.M2M}>
                <div>
                  <span className="font-medium">{t("mcpServers.auth.oauth.m2m")}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{t("mcpServers.auth.oauth.m2mHint")}</span>
                </div>
              </SelectItem>
              <SelectItem value={OAUTH_FLOW.INTERACTIVE}>
                <div>
                  <span className="font-medium">{t("mcpServers.auth.oauth.interactive")}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{t("mcpServers.auth.oauth.interactiveHint")}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </MountedFormField>

      {isM2M ? (
        <>
          <MountedFormField
            label={<FieldLabel label={t("mcpServers.auth.oauth.clientId")} tooltip={t("mcpServers.auth.oauth.clientIdM2MTooltip")} />}
            name={["credentials", "client_id"]}
            required={!isEditing}
            rules={requiredWhenCreating(t("mcpServers.auth.oauth.clientIdM2MRequired"))}
          >
            {(control) => (
              <PasswordInput
                {...textControl(control)}
                placeholder={t("mcpServers.auth.oauth.clientIdPlaceholder", { suffix: placeholderSuffix })}
                groupClassName={fieldClassName}
              />
            )}
          </MountedFormField>
          <MountedFormField
            label={
              <FieldLabel label={t("mcpServers.auth.oauth.clientSecret")} tooltip={t("mcpServers.auth.oauth.clientSecretM2MTooltip")} />
            }
            name={["credentials", "client_secret"]}
            required={!isEditing}
            rules={requiredWhenCreating(t("mcpServers.auth.oauth.clientSecretM2MRequired"))}
          >
            {(control) => (
              <PasswordInput
                {...textControl(control)}
                placeholder={t("mcpServers.auth.oauth.clientSecretPlaceholder", { suffix: placeholderSuffix })}
                groupClassName={fieldClassName}
              />
            )}
          </MountedFormField>
          <MountedFormField
            label={<FieldLabel label={t("mcpServers.auth.oauth.tokenUrl")} tooltip={t("mcpServers.auth.oauth.tokenUrlTooltip")} />}
            name="token_url"
            required={!isEditing}
            rules={requiredWhenCreating(t("mcpServers.auth.oauth.tokenUrlRequired"))}
          >
            {(control) => (
              <Input
                {...textControl(control)}
                placeholder={t("mcpServers.auth.oauth.tokenUrlPlaceholder")}
                className={fieldClassName}
              />
            )}
          </MountedFormField>
          <TokenEndpointAuthMethodField isEditing={isEditing} />
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.scopesOptional")}
                tooltip={t("mcpServers.auth.oauth.scopesM2MTooltip")}
              />
            }
            name={["credentials", "scopes"]}
          >
            {(control) => <MultiSelect {...tagsControl(control)} placeholder={t("mcpServers.auth.oauth.addScopes")} className="rounded-lg" />}
          </MountedFormField>
          <UpstreamResourceField />
          <UpstreamTokenHeaderField />
        </>
      ) : (
        <>
          <MountedFormField
            label={
              <span className="flex items-center justify-between w-full">
                <FieldLabel
                  label={t("mcpServers.auth.oauth.clientIdOptional")}
                  tooltip={t("mcpServers.auth.oauth.clientIdInteractiveTooltip")}
                />
                {docsUrl && (
                  <a
                    href={docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-info hover:text-info/80 ml-2 font-normal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("mcpServers.auth.oauth.createApp")}
                  </a>
                )}
              </span>
            }
            name={["credentials", "client_id"]}
          >
            {(control) => (
              <PasswordInput
                {...textControl(control)}
                placeholder={t("mcpServers.auth.oauth.clientIdShortPlaceholder", { suffix: placeholderSuffix })}
                groupClassName={fieldClassName}
              />
            )}
          </MountedFormField>
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.clientSecretOptional")}
                tooltip={t("mcpServers.auth.oauth.clientSecretInteractiveTooltip")}
              />
            }
            name={["credentials", "client_secret"]}
          >
            {(control) => (
              <PasswordInput
                {...textControl(control)}
                placeholder={t("mcpServers.auth.oauth.clientSecretShortPlaceholder", { suffix: placeholderSuffix })}
                groupClassName={fieldClassName}
              />
            )}
          </MountedFormField>
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.scopesOptional")}
                tooltip={t("mcpServers.auth.oauth.scopesInteractiveTooltip")}
              />
            }
            name={["credentials", "scopes"]}
          >
            {(control) => <MultiSelect {...tagsControl(control)} placeholder={t("mcpServers.auth.oauth.addScopes")} className="rounded-lg" />}
          </MountedFormField>
          <UpstreamResourceField />
          <UpstreamTokenHeaderField />
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.issuer")}
                tooltip={t("mcpServers.auth.oauth.issuerTooltip")}
              />
            }
            name="issuer"
          >
            {(control) => (
              <Input {...textControl(control)} placeholder={t("mcpServers.auth.oauth.issuerPlaceholder")} className={fieldClassName} />
            )}
          </MountedFormField>
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.authorizationUrl")}
                tooltip={t("mcpServers.auth.oauth.authorizationUrlTooltip")}
              />
            }
            name="authorization_url"
          >
            {(control) => (
              <Input
                {...textControl(control)}
                placeholder={t("mcpServers.auth.oauth.authorizationUrlPlaceholder")}
                className={fieldClassName}
              />
            )}
          </MountedFormField>
          <MountedFormField
            label={<FieldLabel label={t("mcpServers.auth.oauth.tokenUrlOptional")} tooltip={t("mcpServers.auth.oauth.tokenUrlOptionalTooltip")} />}
            name="token_url"
          >
            {(control) => (
              <Input
                {...textControl(control)}
                placeholder={t("mcpServers.auth.oauth.tokenUrlPlaceholder")}
                className={fieldClassName}
              />
            )}
          </MountedFormField>
          <TokenEndpointAuthMethodField isEditing={isEditing} />
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.registrationUrl")}
                tooltip={t("mcpServers.auth.oauth.registrationUrlTooltip")}
              />
            }
            name="registration_url"
          >
            {(control) => (
              <Input
                {...textControl(control)}
                placeholder={t("mcpServers.auth.oauth.registrationUrlPlaceholder")}
                className={fieldClassName}
              />
            )}
          </MountedFormField>
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.validationRules")}
                tooltip={t("mcpServers.auth.oauth.validationRulesTooltip")}
              />
            }
            name="token_validation_json"
            rules={{ validate: { json: parsesAsJson(t("mcpServers.auth.oauth.validJson")) } }}
          >
            {(control) => (
              <Textarea
                {...textControl(control)}
                placeholder={'{\n  "organization": "my-org",\n  "team.id": "123"\n}'}
                rows={4}
                className="font-mono text-sm rounded-lg border-border focus:border-info focus:ring-ring"
              />
            )}
          </MountedFormField>
          <MountedFormField
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.storageTtl")}
                tooltip={t("mcpServers.auth.oauth.storageTtlTooltip")}
              />
            }
            name="token_storage_ttl_seconds"
          >
            {(control) => (
              <Input {...numberControl(control)} min={1} placeholder={t("mcpServers.auth.oauth.storageTtlPlaceholder")} className="w-full rounded-lg" />
            )}
          </MountedFormField>
          {oauthFlow && (
            <div className="rounded-lg border border-dashed border-border p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("mcpServers.auth.oauth.authorizeHint")}
              </p>
              <Button
                variant="secondary"
                onClick={oauthFlow.startOAuthFlow}
                disabled={oauthFlow.status === "authorizing" || oauthFlow.status === "exchanging"}
              >
                {oauthFlow.status === "authorizing"
                  ? t("mcpServers.auth.oauth.waiting")
                  : oauthFlow.status === "exchanging"
                    ? t("mcpServers.auth.oauth.exchanging")
                    : t("mcpServers.auth.oauth.authorize")}
              </Button>
              {oauthFlow.error && <p className="text-sm text-destructive">{oauthFlow.error}</p>}
              {oauthFlow.status === "success" && oauthFlow.tokenResponse?.access_token && (
                <p className="text-sm text-success">
                  {t("mcpServers.auth.oauth.tokenFetched", { seconds: oauthFlow.tokenResponse.expires_in ?? "?" })}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default OAuthFormFields;
