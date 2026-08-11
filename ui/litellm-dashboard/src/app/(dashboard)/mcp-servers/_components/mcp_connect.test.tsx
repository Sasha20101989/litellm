import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MCPConnect from "./mcp_connect";

const localization = vi.hoisted(() => ({ language: "ru" as "en" | "ru" }));

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

vi.mock("@/components/networking", () => ({
  getProxyBaseUrl: () => "http://localhost:4000",
}));

describe("MCPConnect", () => {
  beforeEach(() => {
    localization.language = "en";
  });

  it("keeps the connection guides available in English", () => {
    render(<MCPConnect />);

    expect(screen.getByText("Connect to your MCP client")).toBeInTheDocument();
    expect(screen.getByText("OpenAI Responses API Integration")).toBeInTheDocument();
  });

  it("renders every connection guide in Russian", async () => {
    localization.language = "ru";
    const user = userEvent.setup();
    render(<MCPConnect />);

    expect(screen.getByText("Подключите MCP-клиент")).toBeInTheDocument();
    expect(screen.getByText("Интеграция с API Responses OpenAI")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "LiteLLM Proxy" }));
    expect(screen.getByText("Интеграция с API прокси LiteLLM")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Cursor" }));
    expect(screen.getByText("Интеграция с Cursor IDE")).toBeInTheDocument();
    expect(screen.getByText("Инструкции по настройке")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Потоковый HTTP" }));
    expect(screen.getByText("Потоковый транспорт HTTP")).toBeInTheDocument();
    expect(screen.queryByText("Streamable HTTP Transport")).not.toBeInTheDocument();
  });
});
