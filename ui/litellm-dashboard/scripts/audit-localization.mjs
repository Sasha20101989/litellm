import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const LOCALIZED_FILES = [
  "src/components/DashboardHeader.tsx",
  "src/components/Navbar/ViewSwitcher.tsx",
  "src/components/navbar.tsx",
  "src/components/LanguageSelector/LanguageSelector.tsx",
  "src/app/login/LoginPage.tsx",
  "src/app/onboarding/OnboardingForm.tsx",
  "src/app/onboarding/OnboardingFormBody.tsx",
  "src/app/onboarding/OnboardingErrorView.tsx",
  "src/app/onboarding/page.tsx",
  "src/components/public_model_hub.tsx",
  "src/components/activity_metrics.tsx",
  "src/app/model_hub/page.tsx",
  "src/app/model_hub_table/page.tsx",
  "src/app/mcp/oauth/callback/page.tsx",
  "src/app/chat/page.tsx",
  "src/components/chat/ChatShell.tsx",
  "src/components/chat/ConversationList.tsx",
  "src/components/chat/ChatMessages.tsx",
  "src/components/chat/UsagePanel.tsx",
  "src/components/chat/KeysPanel.tsx",
  "src/components/chat/LogsPanel.tsx",
  "src/components/chat/MCPAppsPanel.tsx",
  "src/components/chat/MCPConnectPicker.tsx",
  "src/components/chat/MCPCredentialsTab.tsx",
  "src/components/chat/ConnectFlowBanner.tsx",
  "src/components/chat_ui/ReasoningContent.tsx",
  "src/components/chat_ui/ResponseMetrics.tsx",
  "src/components/chat_ui/MCPEventsDisplay.tsx",
  "src/app/(dashboard)/mcp-servers/_components/AwsSigV4Fields.tsx",
  "src/app/(dashboard)/mcp-servers/_components/CreateMCPServer.tsx",
  "src/app/(dashboard)/mcp-servers/_components/DcrBridgeToggle.tsx",
  "src/app/(dashboard)/mcp-servers/_components/EnvVarsSection.tsx",
  "src/app/(dashboard)/mcp-servers/_components/IdJagFormFields.tsx",
  "src/app/(dashboard)/mcp-servers/_components/MCPPermissionManagement.tsx",
  "src/app/(dashboard)/mcp-servers/_components/MCPServerCard.tsx",
  "src/app/(dashboard)/mcp-servers/_components/MCPSubmissionsTab.tsx",
  "src/app/(dashboard)/mcp-servers/_components/OAuthFormFields.tsx",
  "src/app/(dashboard)/mcp-servers/_components/OpenAPIFormSection.tsx",
  "src/app/(dashboard)/mcp-servers/_components/OpenApiByokFields.tsx",
  "src/app/(dashboard)/mcp-servers/_components/PassthroughAuthorizeSection.tsx",
  "src/app/(dashboard)/mcp-servers/_components/StdioConfiguration.tsx",
  "src/app/(dashboard)/mcp-servers/_components/TokenEndpointAuthMethodField.tsx",
  "src/app/(dashboard)/mcp-servers/_components/TokenExchangeFormFields.tsx",
  "src/app/(dashboard)/mcp-servers/_components/ToolTestPanel.tsx",
  "src/app/(dashboard)/mcp-servers/_components/UserEnvVarsModal.tsx",
  "src/app/(dashboard)/mcp-servers/_components/mcp_connect.tsx",
  "src/app/(dashboard)/mcp-servers/_components/mcp_server_edit.tsx",
  "src/app/(dashboard)/mcp-servers/_components/mcp_server_view.tsx",
  "src/app/(dashboard)/mcp-servers/_components/mcp_tools.tsx",
  "src/components/VirtualKeysPage/VirtualKeysTable.tsx",
  "src/components/VirtualKeysPage/keyTableColumns.tsx",
  "src/app/(dashboard)/policies/_components/ai_suggestion_modal.tsx",
  "src/app/(dashboard)/policies/_components/index.tsx",
  "src/app/(dashboard)/policies/_components/pipeline_flow_builder.tsx",
  "src/app/(dashboard)/policies/_components/template_parameter_modal.tsx",
  "src/app/(dashboard)/search-tools/_components/CreateSearchTools.tsx",
  "src/app/(dashboard)/search-tools/_components/SearchConnectionTest.tsx",
  "src/app/(dashboard)/search-tools/_components/SearchTools.tsx",
  "src/app/(dashboard)/users/_components/view_users/user_info_view.tsx",
  "src/app/(dashboard)/vector-stores/_components/CreateVectorStore.tsx",
  "src/app/(dashboard)/vector-stores/_components/DocumentsTable.tsx",
  "src/app/(dashboard)/vector-stores/_components/IndexesTab.tsx",
  "src/app/(dashboard)/vector-stores/_components/S3VectorsConfig.tsx",
  "src/app/(dashboard)/vector-stores/_components/TestVectorStoreTab.tsx",
  "src/app/(dashboard)/vector-stores/_components/VectorStoreForm.tsx",
  "src/app/(dashboard)/vector-stores/_components/VectorStoreTable.tsx",
  "src/app/(dashboard)/vector-stores/_components/VectorStoreTester.tsx",
  "src/app/(dashboard)/vector-stores/_components/index.tsx",
  "src/app/(dashboard)/vector-stores/_components/vector_store_info.tsx",
  "src/components/vector_store_management/VectorStoreSelector.tsx",
  "src/app/(dashboard)/api-reference/_components/APIReferenceView.tsx",
  "src/app/(dashboard)/cost-optimization/_components/AutoRouterBenchmarksTab.tsx",
  "src/app/(dashboard)/cost-optimization/_components/CacheLeakageCard.tsx",
  "src/app/(dashboard)/mcp-servers/_components/MCPServerCard.tsx",
  "src/app/(dashboard)/mcp-servers/_components/mcp_servers.tsx",
  "src/app/(dashboard)/models-and-endpoints/components/ModelsTableColumns.tsx",
  "src/components/Navbar/UserDropdown/UserDropdown.tsx",
  "src/components/SidebarAccountMenu/SidebarAccountMenu.tsx",
  "src/components/model_dashboard/types.ts",
  "src/components/organisms/create_key_button.tsx",
  "src/components/routing_groups/RoutingGroupModal.tsx",
  "src/components/routing_groups/RoutingGroupUsagePanel.tsx",
  "src/components/shared/SavingsTiles.tsx",
  "src/components/templates/KeySavingsTab.tsx",
  "src/components/templates/key_edit_view.tsx",
  "src/components/templates/key_info_view.tsx",
  "src/components/view_logs/AuditLogsTableColumns.tsx",
];

// These values are product names, identifiers, or protocol terms. Translating
// them would alter commands, configuration, URLs, or externally defined names.
const TECHNICAL_LITERAL_ALLOWLIST = [
  { pattern: /^(?:🚅 )?(?:LiteLLM(?: Brand)?|Nexoplane)$/, reason: "product name" },
  {
    pattern: /^(?:MASTER_KEY|PROXY_ADMIN_ID|DISABLE_ADMIN_UI=False|UI_USERNAME|AUTO_REDIRECT_UI_LOGIN_TO_SSO=true)$/,
    reason: "configuration identifier",
  },
  { pattern: /^(?:SSO|URL|MCP|A2A|OpenID|OAuth)$/, reason: "protocol or industry term" },
  {
    pattern:
      /^(?:ID|24h|7d|30d|90d|\(UTC\)|TPD \(batch\):|USD|-&gt;|->|cURL|Python \(OpenAI SDK\)|JavaScript \(OpenAI SDK\)|OpenAI Python SDK|LlamaIndex|Langchain Py|Client Secret Basic|Client Secret Post)$/,
    reason: "protocol, SDK, time range, or unit",
  },
  { pattern: /^https:\/\/www\.litellm\.ai\/enterprise$/, reason: "external URL" },
  { pattern: /^\{.*\}$/, reason: "JSON configuration example" },
  { pattern: /^fast-chat$/, reason: "model identifier" },
  { pattern: /^(?:TPM|RPM):$/, reason: "rate-limit identifier" },
  { pattern: /^us-west-2$/, reason: "AWS region identifier" },
  { pattern: /^\{"key": "value"\}$/, reason: "JSON example" },
  { pattern: /^https:\/\/github\.com\/BerriAI\/litellm-pgvector$/, reason: "deployment URL" },
  { pattern: /^(?:admin|Admin)$/, reason: "fixed account role" },
  { pattern: /^OR$/, reason: "compact authentication separator" },
  { pattern: /^(?:: )?v$/, reason: "version prefix" },
];

function normalizedText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isTechnicalLiteral(text) {
  return TECHNICAL_LITERAL_ALLOWLIST.some(({ pattern }) => pattern.test(text));
}

function tagName(node) {
  if (ts.isJsxElement(node)) return node.openingElement.tagName.getText();
  return undefined;
}

function isInsideTechnicalMarkup(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (["code", "pre"].includes(tagName(parent)?.toLowerCase())) return true;
  }
  return false;
}

const USER_VISIBLE_PROPERTY_NAMES = new Set(["description", "label", "placeholder", "title", "tooltip"]);

function propertyName(node) {
  return ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : undefined;
}

function isUserVisibleToast(node) {
  return (
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === "toast" &&
    ["error", "fromError", "success", "warning"].includes(node.expression.name.text)
  );
}

export function auditSource(source, file = "source.tsx") {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings = [];
  const seen = new Set();

  const record = (node, rawText, kind) => {
    const text = normalizedText(rawText);
    if (!/[A-Za-z]/.test(text) || isTechnicalLiteral(text)) return;

    const start = node.getStart(sourceFile);
    const key = `${start}:${kind}:${text}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push({ file, line: sourceFile.getLineAndCharacterOfPosition(start).line + 1, text, kind });
  };

  const visit = (node) => {
    if (ts.isJsxText(node) && !isInsideTechnicalMarkup(node)) {
      record(node, node.getText(sourceFile), "jsx-text");
    } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = node.name.getText(sourceFile);
      if (["placeholder", "title", "aria-label", "alt"].includes(name)) {
        record(node, node.initializer.text, `jsx-${name}`);
      }
    } else if (
      ts.isPropertyAssignment(node) &&
      USER_VISIBLE_PROPERTY_NAMES.has(propertyName(node) ?? "") &&
      ts.isStringLiteral(node.initializer)
    ) {
      record(node, node.initializer.text, `property-${propertyName(node)}`);
    } else if (ts.isCallExpression(node) && isUserVisibleToast(node) && ts.isStringLiteral(node.arguments[0])) {
      record(node, node.arguments[0].text, "toast");
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return findings;
}

export function auditFiles(files = LOCALIZED_FILES) {
  return files.flatMap((file) => auditSource(readFileSync(file, "utf8"), file));
}

function runCli() {
  const findings = auditFiles();
  if (findings.length === 0) {
    console.log(`Localization audit passed (${LOCALIZED_FILES.length} shared UI files).`);
    return;
  }

  console.error("Raw user-facing English found in localized shared UI:");
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} [${finding.kind}] ${finding.text}`);
  }
  process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli();
}
