import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, it, expect, vi } from "vitest";
import MCPServerCostConfig from "./mcp_server_cost_config";

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

const tools = [
  { name: "search", description: "Search the index" },
  { name: "fetch", description: "Fetch a document" },
];

describe("MCPServerCostConfig", () => {
  beforeEach(() => {
    localization.language = "en";
  });

  it("renders the cost controls in Russian", () => {
    localization.language = "ru";
    render(<MCPServerCostConfig value={{}} tools={[]} />);

    expect(screen.getByText("Настройка стоимости")).toBeInTheDocument();
    expect(screen.getByText("Стоимость запроса по умолчанию ($)")).toBeInTheDocument();
  });

  it("renders the default cost field with the current value", () => {
    render(<MCPServerCostConfig value={{ default_cost_per_query: 0.02 }} tools={[]} />);

    expect(screen.getByText("Cost Configuration")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.0000")).toHaveValue("0.0200");
  });

  it("reports the edited default cost as a number", async () => {
    const onChange = vi.fn();
    render(<MCPServerCostConfig value={{}} tools={[]} onChange={onChange} />);

    await userEvent.type(screen.getByPlaceholderText("0.0000"), "0.5");

    expect(onChange).toHaveBeenLastCalledWith({ default_cost_per_query: 0.5 });
  });

  it("disables the default cost field when disabled", () => {
    render(<MCPServerCostConfig value={{}} tools={[]} disabled />);

    expect(screen.getByPlaceholderText("0.0000")).toBeDisabled();
  });

  it("hides the per-tool section when the server exposes no tools", () => {
    render(<MCPServerCostConfig value={{}} tools={[]} />);

    expect(screen.queryByText("Available Tools")).not.toBeInTheDocument();
  });

  it("offers a per-tool override for every tool once tools are loaded", async () => {
    render(<MCPServerCostConfig value={{}} tools={tools} />);

    await userEvent.click(screen.getByText("Available Tools"));

    expect(screen.getByText("search")).toBeInTheDocument();
    expect(screen.getByText("Search the index")).toBeInTheDocument();
    expect(screen.getByText("fetch")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("Use default")).toHaveLength(2);
  });

  it("merges a per-tool override into the existing cost map", async () => {
    const onChange = vi.fn();
    render(
      <MCPServerCostConfig
        value={{ default_cost_per_query: 0.01, tool_name_to_cost_per_query: { fetch: 0.2 } }}
        tools={tools}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByText("Available Tools"));
    await userEvent.type(screen.getAllByPlaceholderText("Use default")[0], "3");

    expect(onChange).toHaveBeenLastCalledWith({
      default_cost_per_query: 0.01,
      tool_name_to_cost_per_query: { fetch: 0.2, search: 3 },
    });
  });

  it("summarises the configured costs", () => {
    render(
      <MCPServerCostConfig
        value={{ default_cost_per_query: 0.01, tool_name_to_cost_per_query: { search: 0.25 } }}
        tools={tools}
      />,
    );

    expect(screen.getByText("• Default cost: $0.0100 per query")).toBeInTheDocument();
    expect(screen.getByText("• search: $0.2500 per query")).toBeInTheDocument();
  });

  it("shows no summary when nothing is configured", () => {
    render(<MCPServerCostConfig value={{}} tools={tools} />);

    expect(screen.queryByText("Cost Summary:")).not.toBeInTheDocument();
  });
});
