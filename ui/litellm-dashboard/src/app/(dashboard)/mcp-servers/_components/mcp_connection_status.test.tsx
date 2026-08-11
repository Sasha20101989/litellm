import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import MCPConnectionStatus from "./mcp_connection_status";

const localization = vi.hoisted(() => ({ language: "en" as "en" | "ru" }));

vi.mock("react-i18next", async () => {
  const { resources } = await import("@/i18n/catalog");
  const t = (key: string, values?: Record<string, unknown>) => {
    const copy = key.split(".").reduce<unknown>((value, segment) => {
      if (typeof value !== "object" || value === null) return undefined;
      return (value as Record<string, unknown>)[segment];
    }, resources[localization.language].gateway);
    if (typeof copy !== "string") return key;
    return Object.entries(values ?? {}).reduce(
      (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
      copy,
    );
  };
  return { useTranslation: () => ({ t, i18n: { language: localization.language } }) };
});

describe("MCPConnectionStatus", () => {
  const defaultProps = {
    formValues: { url: "https://example.com/mcp" },
    tools: [] as any[],
    isLoadingTools: false,
    toolsError: null,
    toolsErrorStackTrace: null,
    canFetchTools: false,
    fetchTools: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localization.language = "en";
  });

  it("renders the connection status in Russian", () => {
    localization.language = "ru";
    render(<MCPConnectionStatus {...defaultProps} />);

    expect(screen.getByText("Состояние подключения")).toBeInTheDocument();
    expect(screen.getByText("Заполните обязательные поля для проверки подключения")).toBeInTheDocument();
  });

  it("should render nothing when canFetchTools is false and no URL is set", () => {
    const { container } = render(<MCPConnectionStatus {...defaultProps} formValues={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("should show 'Complete required fields' message when URL is set but canFetchTools is false", () => {
    render(<MCPConnectionStatus {...defaultProps} />);
    expect(screen.getByText(/Complete required fields to test connection/i)).toBeInTheDocument();
  });

  it("should show 'Connection successful' when tools are loaded", () => {
    render(<MCPConnectionStatus {...defaultProps} canFetchTools={true} tools={[{ name: "tool1" }]} />);
    expect(screen.getByText("Connection successful")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("should show loading state when isLoadingTools is true", () => {
    render(<MCPConnectionStatus {...defaultProps} canFetchTools={true} isLoadingTools={true} />);
    expect(screen.getByText(/Testing connection to MCP server/i)).toBeInTheDocument();
    expect(screen.getByText("Connecting...")).toBeInTheDocument();
  });

  it("should show info message without retry when tool preview returns 403", () => {
    render(
      <MCPConnectionStatus
        {...defaultProps}
        canFetchTools={true}
        toolsError="Tool preview is not available for submissions. Tools will be verified by an admin during review."
        toolsErrorStatus={403}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/Tools will be verified by an admin during review/i);
    expect(screen.queryByText("Connection Failed")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("should show error state with retry button when toolsError is set", async () => {
    const fetchTools = vi.fn();
    const user = userEvent.setup();
    render(
      <MCPConnectionStatus
        {...defaultProps}
        canFetchTools={true}
        toolsError="Connection refused"
        fetchTools={fetchTools}
      />,
    );

    expect(screen.getByText("Connection Failed")).toBeInTheDocument();
    expect(screen.getByText("Connection refused")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(fetchTools).toHaveBeenCalled();
  });

  it("should show 'No tools found' when connection succeeds but no tools returned", () => {
    render(<MCPConnectionStatus {...defaultProps} canFetchTools={true} tools={[]} />);
    expect(screen.getByText(/No tools found for this MCP server/i)).toBeInTheDocument();
  });
});
