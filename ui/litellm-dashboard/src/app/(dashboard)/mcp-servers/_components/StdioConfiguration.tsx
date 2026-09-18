import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { SimpleTooltip } from "@/components/ui/tooltip";

import { MountedFormField } from "@/components/common_components/MountedFormField";
import { requiredRule } from "@/components/common_components/formRules";
import { Textarea } from "@/components/ui/textarea";
import { parsesAsJson, textControl } from "./mcpFieldRules";

interface StdioConfigurationProps {
  isVisible: boolean;
  /**
   * When true, stdio_config is required + validated as JSON.
   * Edit screen can set this to false when using dedicated command/args/env fields.
   */
  required?: boolean;
}

const PLACEHOLDER = `{
  "mcpServers": {
    "circleci-mcp-server": {
      "command": "npx",
      "args": ["-y", "@circleci/mcp-server-circleci"],
      "env": {
        "CIRCLECI_TOKEN": "your-circleci-token",
        "CIRCLECI_BASE_URL": "https://circleci.com"
      }
    }
  }
}`;

const StdioConfiguration: React.FC<StdioConfigurationProps> = ({ isVisible, required = true }) => {
  const { t } = useTranslation("gateway");
  if (!isVisible) return null;

  return (
    <MountedFormField
      label={
        <span className="text-sm font-medium text-foreground flex items-center">
          {t("mcpServers.forms.stdio.title")}
          <SimpleTooltip content={t("mcpServers.forms.stdio.tooltip")}>
            <Info className="ml-2 size-4 text-info hover:text-info/80 cursor-help" />
          </SimpleTooltip>
        </span>
      }
      name="stdio_config"
      required={required}
      rules={{
        validate: {
          ...(required ? { required: requiredRule(t("mcpServers.forms.stdio.required")) } : {}),
          json: parsesAsJson(t("mcpServers.forms.stdio.validJson")),
        },
      }}
    >
      {(control) => (
        <Textarea
          {...textControl(control)}
          placeholder={PLACEHOLDER}
          rows={12}
          className="rounded-lg border-border focus:border-info focus:ring-ring font-mono text-sm"
        />
      )}
    </MountedFormField>
  );
};

export default StdioConfiguration;
