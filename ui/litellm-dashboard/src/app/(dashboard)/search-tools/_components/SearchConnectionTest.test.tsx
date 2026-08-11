import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SearchConnectionTest from "./SearchConnectionTest";
import * as networking from "@/components/networking";
import NotificationsManager from "@/components/molecules/notifications_manager";

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
  return {
    useTranslation: () => ({
      t,
      i18n: { language: localization.language, resolvedLanguage: localization.language },
    }),
  };
});

vi.mock("@/components/networking", () => ({
  testSearchToolConnection: vi.fn(),
}));

const defaultProps = {
  litellmParams: { search_provider: "tavily" },
  accessToken: "test-token",
};

describe("SearchConnectionTest", () => {
  beforeEach(() => {
    localization.language = "en";
    vi.clearAllMocks();
  });

  it("renders the connection check in Russian", async () => {
    localization.language = "ru";
    vi.mocked(networking.testSearchToolConnection).mockResolvedValue({
      status: "success",
      message: "ok",
      results_count: 3,
    });

    render(<SearchConnectionTest {...defaultProps} />);

    expect(await screen.findByText("Подключение к tavily установлено!")).toBeInTheDocument();
    expect(screen.getByText("Получено результатов: 3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Открыть документацию по поиску" })).toBeInTheDocument();
  });

  it("passes the access token and params to the connection test", async () => {
    vi.mocked(networking.testSearchToolConnection).mockResolvedValue({
      status: "success",
      message: "ok",
    });

    render(<SearchConnectionTest {...defaultProps} />);

    await waitFor(() => {
      expect(networking.testSearchToolConnection).toHaveBeenCalledWith(
        defaultProps.accessToken,
        defaultProps.litellmParams,
      );
    });
  });

  it("shows a loading state naming the provider while the test is pending", () => {
    vi.mocked(networking.testSearchToolConnection).mockReturnValue(new Promise(() => {}));

    render(<SearchConnectionTest {...defaultProps} />);

    expect(screen.getByText(/Testing connection to tavily/i)).toBeInTheDocument();
  });

  it("renders a success state with the test query and result count", async () => {
    vi.mocked(networking.testSearchToolConnection).mockResolvedValue({
      status: "success",
      message: "ok",
      test_query: "hello world",
      results_count: 3,
    });

    render(<SearchConnectionTest {...defaultProps} />);

    expect(await screen.findByText(/Connection to tavily successful/i)).toBeInTheDocument();
    expect(screen.getByText("hello world")).toBeInTheDocument();
    expect(screen.getByText(/Results retrieved: 3/i)).toBeInTheDocument();
  });

  it("fires a success notification and completion callback on a successful test", async () => {
    const onTestComplete = vi.fn();
    vi.mocked(networking.testSearchToolConnection).mockResolvedValue({
      status: "success",
      message: "ok",
    });

    render(<SearchConnectionTest {...defaultProps} onTestComplete={onTestComplete} />);

    await waitFor(() => {
      expect(NotificationsManager.success).toHaveBeenCalledWith("Connection test successful!");
    });
    expect(onTestComplete).toHaveBeenCalledTimes(1);
  });

  it("renders a failure state with a cleaned error message and error type", async () => {
    vi.mocked(networking.testSearchToolConnection).mockResolvedValue({
      status: "error",
      message: "litellm.AuthenticationError: Invalid API key\nstack trace: deep internals",
      error_type: "AuthenticationError",
    });

    render(<SearchConnectionTest {...defaultProps} />);

    expect(await screen.findByText(/Connection to tavily failed/i)).toBeInTheDocument();
    expect(screen.getByText("Invalid API key")).toBeInTheDocument();
    expect(screen.getByText("AuthenticationError")).toBeInTheDocument();
    expect(screen.getByText("Verify your API key is correct and active")).toBeInTheDocument();
  });

  it("reveals the raw error details when Show Details is toggled", async () => {
    const user = userEvent.setup();
    vi.mocked(networking.testSearchToolConnection).mockResolvedValue({
      status: "error",
      message: "litellm.AuthenticationError: Invalid API key\nstack trace: deep internals",
      error_type: "AuthenticationError",
    });

    render(<SearchConnectionTest {...defaultProps} />);

    const toggle = await screen.findByRole("button", { name: /show details/i });
    expect(screen.queryByText("Full Error Details")).not.toBeInTheDocument();

    await user.click(toggle);

    expect(screen.getByText("Full Error Details")).toBeInTheDocument();
    expect(screen.getByText(/stack trace: deep internals/i)).toBeInTheDocument();
  });

  it("treats a rejected request as a connection failure", async () => {
    vi.mocked(networking.testSearchToolConnection).mockRejectedValue(new Error("network down"));

    render(<SearchConnectionTest {...defaultProps} />);

    expect(await screen.findByText(/Connection to tavily failed/i)).toBeInTheDocument();
    expect(screen.getByText("network down")).toBeInTheDocument();
  });

  it("links out to the search documentation", async () => {
    vi.mocked(networking.testSearchToolConnection).mockResolvedValue({
      status: "success",
      message: "ok",
    });

    render(<SearchConnectionTest {...defaultProps} />);

    const docLink = await screen.findByRole("link", { name: /View Search Documentation/i });
    expect(docLink).toHaveAttribute("href", "https://docs.litellm.ai/docs/search");
  });
});
