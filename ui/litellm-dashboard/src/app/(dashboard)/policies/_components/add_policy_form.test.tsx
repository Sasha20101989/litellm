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
  getResolvedGuardrails: vi.fn(),
  modelAvailableCall: vi.fn(),
}));

import AddPolicyForm from "./add_policy_form";

describe("AddPolicyForm", () => {
  it("renders the policy mode picker in Russian", () => {
    render(
      <AddPolicyForm
        visible
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        onOpenFlowBuilder={vi.fn()}
        accessToken={null}
        existingPolicies={[]}
        availableGuardrails={[]}
        createPolicy={vi.fn()}
        updatePolicy={vi.fn()}
      />,
    );

    expect(screen.getByText("Создание политики")).toBeInTheDocument();
    expect(screen.getByText("Простой режим")).toBeInTheDocument();
    expect(screen.getByText("Конструктор потока")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Создать политику" })).toBeInTheDocument();
  });
});
