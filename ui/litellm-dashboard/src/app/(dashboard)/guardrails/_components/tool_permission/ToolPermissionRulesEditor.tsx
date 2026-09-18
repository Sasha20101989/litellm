import React from "react";
import { useTranslation } from "react-i18next";
import { Info, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type ToolPermissionDecision = "allow" | "deny";
export type ToolPermissionDefaultAction = "allow" | "deny";
export type ToolPermissionOnDisallowedAction = "block" | "rewrite";

export interface ToolPermissionRuleConfig {
  id: string;
  tool_name?: string;
  tool_type?: string;
  decision: ToolPermissionDecision;
  allowed_param_patterns?: Record<string, string>;
}

export interface ToolPermissionConfig {
  rules: ToolPermissionRuleConfig[];
  default_action: ToolPermissionDefaultAction;
  on_disallowed_action: ToolPermissionOnDisallowedAction;
  violation_message_template?: string;
}

interface ToolPermissionRulesEditorProps {
  value?: ToolPermissionConfig;
  onChange?: (config: ToolPermissionConfig) => void;
  disabled?: boolean;
}

const DEFAULT_CONFIG: ToolPermissionConfig = {
  rules: [],
  default_action: "deny",
  on_disallowed_action: "block",
  violation_message_template: "",
};

const ensureConfig = (config?: ToolPermissionConfig): ToolPermissionConfig => ({
  ...DEFAULT_CONFIG,
  ...(config || {}),
  rules: config?.rules ? [...config.rules] : [],
});

const ToolPermissionRulesEditor: React.FC<ToolPermissionRulesEditorProps> = ({ value, onChange, disabled = false }) => {
  const { t } = useTranslation("gateway");
  const DECISION_ITEMS = [
    { value: "allow", label: t("guardrailsPage.toolPermission.allow") },
    { value: "deny", label: t("guardrailsPage.toolPermission.deny") },
  ] as const;
  const ON_DISALLOWED_ITEMS = [
    { value: "block", label: t("guardrailsPage.toolPermission.block") },
    { value: "rewrite", label: t("guardrailsPage.toolPermission.rewrite") },
  ] as const;
  const config = ensureConfig(value);

  const updateConfig = (partial: Partial<ToolPermissionConfig>) => {
    const nextConfig: ToolPermissionConfig = {
      ...config,
      ...partial,
    };
    onChange?.(nextConfig);
  };

  const updateRule = (ruleIndex: number, updates: Partial<ToolPermissionRuleConfig>) => {
    const nextRules = config.rules.map((rule, index) => (index === ruleIndex ? { ...rule, ...updates } : rule));
    updateConfig({ rules: nextRules });
  };

  const addRule = () => {
    const nextRules = [
      ...config.rules,
      {
        id: `rule_${Math.random().toString(36).slice(2, 8)}`,
        decision: "allow" as ToolPermissionDecision,
        allowed_param_patterns: undefined,
      },
    ];
    updateConfig({ rules: nextRules });
  };

  const removeRule = (ruleIndex: number) => {
    const nextRules = config.rules.filter((_, index) => index !== ruleIndex);
    updateConfig({ rules: nextRules });
  };

  const updateAllowedParamEntries = (ruleIndex: number, mutate: (entries: [string, string][]) => void) => {
    const targetRule = config.rules[ruleIndex];
    if (!targetRule) {
      return;
    }
    const entries = Object.entries(targetRule.allowed_param_patterns || {});
    mutate(entries);
    const updatedObject: Record<string, string> = {};
    entries.forEach(([key, value]) => {
      updatedObject[key] = value;
    });
    updateRule(ruleIndex, {
      allowed_param_patterns: Object.keys(updatedObject).length > 0 ? updatedObject : undefined,
    });
  };

  const updateAllowedParamPath = (ruleIndex: number, entryIndex: number, nextPath: string) => {
    updateAllowedParamEntries(ruleIndex, (entries) => {
      if (!entries[entryIndex]) {
        return;
      }
      const [, value] = entries[entryIndex];
      entries[entryIndex] = [nextPath, value];
    });
  };

  const updateAllowedParamPattern = (ruleIndex: number, entryIndex: number, pattern: string) => {
    updateAllowedParamEntries(ruleIndex, (entries) => {
      if (!entries[entryIndex]) {
        return;
      }
      const [path] = entries[entryIndex];
      entries[entryIndex] = [path, pattern];
    });
  };

  const renderAllowedParamPatterns = (rule: ToolPermissionRuleConfig, index: number) => {
    const entries = Object.entries(rule.allowed_param_patterns || {});
    if (entries.length === 0) {
      return (
        <Button
          variant="outline"
          disabled={disabled}
          size="sm"
          onClick={() => updateRule(index, { allowed_param_patterns: { "": "" } })}
        >
          {t("guardrailsPage.toolPermission.restrictArguments")}
        </Button>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t("guardrailsPage.toolPermission.argumentConstraints")}</p>
        {entries.map(([path, pattern], patternIndex) => (
          <div key={`${rule.id || index}-${patternIndex}`} className="flex items-start gap-2">
            <Input
              disabled={disabled}
              placeholder="messages[0].content"
              value={path}
              onChange={(e) => updateAllowedParamPath(index, patternIndex, e.target.value)}
            />
            <Input
              disabled={disabled}
              placeholder="^email@.*$"
              value={pattern}
              onChange={(e) => updateAllowedParamPattern(index, patternIndex, e.target.value)}
            />
            <Button
              variant="outline"
              size="icon"
              aria-label={t("guardrailsPage.toolPermission.remove")}
              disabled={disabled}
              onClick={() =>
                updateAllowedParamEntries(index, (entries) => {
                  entries.splice(patternIndex, 1);
                })
              }
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          disabled={disabled}
          size="sm"
          onClick={() =>
            updateRule(index, {
              allowed_param_patterns: {
                ...(rule.allowed_param_patterns || {}),
                "": "",
              },
            })
          }
        >
          {t("guardrailsPage.toolPermission.addConstraint")}
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{t("guardrailsPage.toolPermission.title")}</p>
            <p className="text-sm text-muted-foreground">
              {t("guardrailsPage.toolPermission.description")}
            </p>
          </div>
          {!disabled && (
            <Button onClick={addRule}>
              <Plus />
              {t("guardrailsPage.toolPermission.addRule")}
            </Button>
          )}
        </div>

        <Separator className="my-4" />

        {config.rules.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">{t("guardrailsPage.toolPermission.empty")}</div>
        ) : (
          <div className="space-y-4">
            {config.rules.map((rule, index) => (
              <Card key={rule.id || index} className="bg-muted/40">
                <CardContent>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">{t("guardrailsPage.toolPermission.ruleNumber", { number: index + 1 })}</p>
                    <Button variant="ghost" disabled={disabled} onClick={() => removeRule(index)}>
                      <Trash2 />
                      {t("guardrailsPage.toolPermission.remove")}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">{t("guardrailsPage.toolPermission.ruleId")}</p>
                      <Input
                        disabled={disabled}
                        placeholder="unique_rule_id"
                        value={rule.id}
                        onChange={(e) => updateRule(index, { id: e.target.value })}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("guardrailsPage.toolPermission.toolName")}</p>
                      <Input
                        disabled={disabled}
                        placeholder="^mcp__github_.*$"
                        value={rule.tool_name ?? ""}
                        onChange={(e) =>
                          updateRule(index, {
                            tool_name: e.target.value.trim() === "" ? undefined : e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">{t("guardrailsPage.toolPermission.toolType")}</p>
                      <Input
                        disabled={disabled}
                        placeholder="^function$"
                        value={rule.tool_type ?? ""}
                        onChange={(e) =>
                          updateRule(index, {
                            tool_type: e.target.value.trim() === "" ? undefined : e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-sm font-medium">{t("guardrailsPage.toolPermission.decision")}</p>
                    <Select
                      items={DECISION_ITEMS}
                      disabled={disabled}
                      value={rule.decision}
                      onValueChange={(value: string | null) =>
                        value && updateRule(index, { decision: value as ToolPermissionDecision })
                      }
                    >
                      <SelectTrigger className="w-[200px]" aria-label={t("guardrailsPage.toolPermission.decision")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DECISION_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4">{renderAllowedParamPatterns(rule, index)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Separator className="my-4" />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">{t("guardrailsPage.toolPermission.defaultAction")}</p>
            <Select
              items={DECISION_ITEMS}
              disabled={disabled}
              value={config.default_action}
              onValueChange={(value: string | null) =>
                value && updateConfig({ default_action: value as ToolPermissionDefaultAction })
              }
            >
              <SelectTrigger className="w-full" aria-label={t("guardrailsPage.toolPermission.defaultAction")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DECISION_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="flex items-center gap-1 text-sm font-medium">
              {t("guardrailsPage.toolPermission.onDisallowed")}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="cursor-help text-muted-foreground">
                      <Info className="size-3.5" />
                    </span>
                  }
                />
                <TooltipContent>
                  {t("guardrailsPage.toolPermission.onDisallowedHelp")}
                </TooltipContent>
              </Tooltip>
            </p>
            <Select
              items={ON_DISALLOWED_ITEMS}
              disabled={disabled}
              value={config.on_disallowed_action}
              onValueChange={(value: string | null) =>
                value && updateConfig({ on_disallowed_action: value as ToolPermissionOnDisallowedAction })
              }
            >
              <SelectTrigger className="w-full" aria-label={t("guardrailsPage.toolPermission.onDisallowed")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ON_DISALLOWED_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium">{t("guardrailsPage.toolPermission.violationMessage")}</p>
          <Textarea
            className="field-sizing-fixed"
            disabled={disabled}
            rows={3}
            placeholder={t("guardrailsPage.toolPermission.violationPlaceholder")}
            value={config.violation_message_template}
            onChange={(e) => updateConfig({ violation_message_template: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolPermissionRulesEditor;
