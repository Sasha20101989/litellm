import { render, screen } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import TruePassthroughWarning from "./TruePassthroughWarning";
import { AUTH_TYPE } from "@/components/mcp_tools/types";

const localization = vi.hoisted(() => ({ language: "en" as "en" | "ru" }));

vi.mock("react-i18next", async () => {
  const { resources } = await import("@/i18n/catalog");
  const t = (key: string) =>
    key.split(".").reduce<unknown>((value, segment) => {
      if (typeof value !== "object" || value === null) return undefined;
      return (value as Record<string, unknown>)[segment];
    }, resources[localization.language].gateway) as string;
  return { useTranslation: () => ({ t, i18n: { language: localization.language } }) };
});

describe("TruePassthroughWarning", () => {
  beforeEach(() => {
    localization.language = "en";
  });

  it("renders the warning in Russian", () => {
    localization.language = "ru";
    render(<TruePassthroughWarning authType={AUTH_TYPE.TRUE_PASSTHROUGH} />);

    expect(screen.getByText("Прямой прокси отключает аутентификацию LiteLLM для этого сервера")).toBeInTheDocument();
  });

  it("warns when auth type is true_passthrough", () => {
    render(<TruePassthroughWarning authType={AUTH_TYPE.TRUE_PASSTHROUGH} />);

    expect(screen.getByText("True Passthrough disables LiteLLM authentication for this server")).toBeInTheDocument();
    expect(screen.getByText(/Anyone who can reach the gateway can call this server/)).toBeInTheDocument();
  });

  it("renders nothing for any other auth type", () => {
    const { container } = render(<TruePassthroughWarning authType={AUTH_TYPE.OAUTH2} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when no auth type is set", () => {
    const { container } = render(<TruePassthroughWarning authType={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
