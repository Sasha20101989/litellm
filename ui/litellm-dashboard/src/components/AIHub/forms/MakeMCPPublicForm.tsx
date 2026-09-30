import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/cva.config";
import { makeMCPPublicCall } from "../../networking";
import { toast } from "@/lib/toast";
import { MCPServerData } from "@/components/AIHub/MCPHubTableColumns";
import { useTranslation } from "react-i18next";

const statusVariant = (status?: string) => {
  if (status === "active" || status === "healthy") {
    return "default" as const;
  }
  if (status === "inactive" || status === "unhealthy") {
    return "destructive" as const;
  }
  return "outline" as const;
};

interface MakeMCPPublicFormProps {
  visible: boolean;
  onClose: () => void;
  accessToken: string;
  mcpHubData: MCPServerData[];
  onSuccess: () => void;
}

interface PublicationSelection {
  readonly catalog: MCPServerData[];
  readonly serverIds: Set<string>;
}

const MakeMCPPublicForm: React.FC<MakeMCPPublicFormProps> = ({
  visible,
  onClose,
  accessToken,
  mcpHubData,
  onSuccess,
}) => {
  const { t } = useTranslation("common");
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState<PublicationSelection | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedServers = selection?.serverIds ?? new Set<string>();
  const hasPublicationMetadata = mcpHubData.every((server) => typeof server.mcp_info?.is_public_explicit === "boolean");
  const canManagePublication = hasPublicationMetadata && selection?.catalog === mcpHubData;
  const publicationYaml = [
    "litellm_settings:",
    "  public_mcp_hub_strict_whitelist: true",
    selectedServers.size === 0
      ? "  public_mcp_servers: []"
      : `  public_mcp_servers:\n${Array.from(selectedServers, (id) => `    - ${JSON.stringify(id)}`).join("\n")}`,
  ].join("\n");

  const handleClose = () => {
    setCurrentStep(0);
    setSelection(null);
    onClose();
  };

  const handleNext = () => {
    if (!canManagePublication) return;
    if (currentStep === 0) {
      setCurrentStep(1);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  const handleServerSelection = (serverId: string, checked: boolean) => {
    const newSelection = new Set(selectedServers);
    if (checked) {
      newSelection.add(serverId);
    } else {
      newSelection.delete(serverId);
    }
    setSelection({ catalog: mcpHubData, serverIds: newSelection });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allServerIds = mcpHubData.map((server) => server.server_id);
      setSelection({ catalog: mcpHubData, serverIds: new Set(allServerIds) });
    } else {
      setSelection({ catalog: mcpHubData, serverIds: new Set() });
    }
  };

  useEffect(() => {
    if (!visible || !hasPublicationMetadata) {
      setSelection(null);
      return;
    }
    const publicServerIds = mcpHubData
      .filter((server) => server.mcp_info.is_public_explicit === true)
      .map((server) => server.server_id);
    setSelection({ catalog: mcpHubData, serverIds: new Set(publicServerIds) });
    setCurrentStep(0);
  }, [visible, mcpHubData, hasPublicationMetadata]);

  const handleSubmit = async () => {
    if (!canManagePublication) return;
    setLoading(true);
    try {
      const serverIdsToMakePublic = Array.from(selectedServers);

      // Make batch API call for all servers
      await makeMCPPublicCall(accessToken, serverIdsToMakePublic);

      toast.success(t("publicHub.forms.mcp.publicationUpdated"));
      handleClose();
      onSuccess();
    } catch (error) {
      console.error("Error making MCP servers public:", error);
      toast.fromError(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1Content = () => {
    const allServersSelected =
      mcpHubData.length > 0 && mcpHubData.every((server) => selectedServers.has(server.server_id));
    const isIndeterminate = selectedServers.size > 0 && !allServersSelected;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("publicHub.forms.mcp.selectHubTitle")}</h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={allServersSelected}
                indeterminate={isIndeterminate}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                disabled={mcpHubData.length === 0}
              />
              {mcpHubData.length > 0
                ? t("publicHub.forms.selectAll", { count: mcpHubData.length })
                : t("publicHub.forms.mcp.selectAll")}
            </label>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {t("publicHub.forms.mcp.selectHubDescription")}
        </p>

        <p className="text-xs text-muted-foreground">
          {t("publicHub.forms.mcp.legacyModeDescription")}
        </p>

        <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
          <div className="space-y-3">
            {mcpHubData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("publicHub.forms.mcp.empty")}</p>
              </div>
            ) : (
              mcpHubData.map((server) => {
                const isPublic = server.mcp_info?.is_public === true;
                return (
                  <div
                    key={server.server_id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent"
                  >
                    <Checkbox
                      aria-label={t("publicHub.forms.mcp.publishServer", { name: server.server_name })}
                      checked={selectedServers.has(server.server_id)}
                      onCheckedChange={(checked) => handleServerSelection(server.server_id, checked === true)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium break-words">{server.server_name}</p>
                        {isPublic && (
                          <Badge>
                            {server.mcp_info?.is_public_explicit === false
                              ? t("publicHub.forms.mcp.legacyListed")
                              : t("publicHub.table.listed")}
                          </Badge>
                        )}
                        <Badge variant="secondary">{server.transport}</Badge>
                        <Badge variant={statusVariant(server.status)}>{server.status || "unknown"}</Badge>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{server.server_id}</p>
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        {server.description || server.url}
                      </p>
                      {server.allowed_tools && server.allowed_tools.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {server.allowed_tools.slice(0, 3).map((tool, idx) => (
                            <Badge key={idx} variant="outline">
                              {tool}
                            </Badge>
                          ))}
                          {server.allowed_tools.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              {t("publicHub.forms.mcp.more", { count: server.allowed_tools.length - 3 })}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <details className="rounded-lg border p-3">
          <summary className="cursor-pointer text-sm font-medium">{t("publicHub.forms.mcp.configureYaml")}</summary>
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("publicHub.forms.mcp.yamlDescription")}
            </p>
            <CodeBlock code={publicationYaml} language="yaml" />
          </div>
        </details>

        {selectedServers.size > 0 && (
          <div className="bg-info/10 border border-info/20 rounded-lg p-3">
            <p className="text-sm text-info">
              {t("publicHub.forms.mcp.selectedCount", { count: selectedServers.size })}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep2Content = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("publicHub.forms.mcp.confirmHubTitle")}</h3>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <p className="text-sm text-warning">
            {t("publicHub.forms.mcp.publicationWarning")}
          </p>
        </div>

        <div className="space-y-3">
          <p className="font-medium">{t("publicHub.forms.mcp.publicationList")}</p>
          <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
            <div className="space-y-2">
              {selectedServers.size === 0 && <p className="text-sm">{t("publicHub.forms.mcp.noPublished")}</p>}
              {Array.from(selectedServers).map((serverId) => {
                const server = mcpHubData.find((s) => s.server_id === serverId);
                return (
                  <div key={serverId} className="flex items-center justify-between p-2 bg-muted rounded-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium break-words">{server?.server_name || serverId}</p>
                        {server && (
                          <>
                            <Badge variant="secondary">{server.transport}</Badge>
                            <Badge variant={statusVariant(server.status)}>{server.status || "unknown"}</Badge>
                          </>
                        )}
                      </div>
                      {server?.description && (
                        <p className="text-xs text-muted-foreground mt-1 break-words">{server.description}</p>
                      )}
                      {server?.url && <p className="text-xs text-muted-foreground mt-1 break-words">{server.url}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-info/10 border border-info/20 rounded-lg p-3">
          <p className="text-sm text-info">
            {t("publicHub.forms.mcp.replaceList", { count: selectedServers.size })}
          </p>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (!hasPublicationMetadata) {
      return (
        <div role="alert" className="rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm">
          {t("publicHub.forms.mcp.metadataUnavailable")}
        </div>
      );
    }
    if (!canManagePublication) return <p role="status">{t("publicHub.forms.mcp.loading")}</p>;
    switch (currentStep) {
      case 0:
        return renderStep1Content();
      case 1:
        return renderStep2Content();
      default:
        return null;
    }
  };

  const renderStepButtons = () => {
    return (
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={currentStep === 0 ? handleClose : handlePrevious}>
          {currentStep === 0 ? t("publicHub.forms.cancel") : t("publicHub.forms.previous")}
        </Button>

        <div className="flex space-x-2">
          {currentStep === 0 && (
            <Button onClick={handleNext} disabled={!canManagePublication}>
              {t("publicHub.forms.next")}
            </Button>
          )}

          {currentStep === 1 && (
            <Button onClick={handleSubmit} disabled={loading || !canManagePublication}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {t("publicHub.forms.mcp.savePublicationList")}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleClose()} disablePointerDismissal>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>{t("publicHub.admin.manageMcpVisibility")}</DialogTitle>
        </DialogHeader>

        <div>
          <ol className="mb-6 flex items-center gap-6">
            {[t("publicHub.forms.mcp.selectStep"), t("publicHub.forms.confirm")].map((title, index) => (
              <li
                key={title}
                className="flex items-center gap-2"
                aria-current={currentStep === index ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border text-xs",
                    currentStep === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span className={cn("text-sm", currentStep === index ? "font-medium" : "text-muted-foreground")}>
                  {title}
                </span>
              </li>
            ))}
          </ol>

          {renderStepContent()}
          {renderStepButtons()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MakeMCPPublicForm;
