import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
  return {
    useTranslation: () => ({
      t,
      i18n: { language: localization.language, resolvedLanguage: localization.language },
    }),
  };
});

vi.mock("@/app/(dashboard)/hooks/useAuthorized", () => ({
  default: () => ({ userId: "user-1", userRole: "Admin" }),
}));

vi.mock("@/components/networking", () => ({
  resolvePoliciesCall: vi.fn(),
  teamListCall: vi.fn(),
  keyListCall: vi.fn(),
  modelAvailableCall: vi.fn(),
}));

import PolicyTestPanel from "./policy_test_panel";

describe("PolicyTestPanel", () => {
  it("renders the simulator in Russian", () => {
    render(<PolicyTestPanel accessToken={null} />);

    expect(screen.getByText("Симулятор политик")).toBeInTheDocument();
    expect(screen.getByText("Псевдоним команды")).toBeInTheDocument();
    expect(screen.getByText("Введите тег и нажмите Enter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Симулировать" })).toBeInTheDocument();
    expect(screen.getByText("Симуляция ещё не запускалась")).toBeInTheDocument();
  });
});
