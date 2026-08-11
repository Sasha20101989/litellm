import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CredentialItem } from "@/components/networking";
import { Providers, providerLogoMap } from "@/components/provider_info_helpers";
import { VectorStoreProviders } from "@/components/vector_store_providers";
import VectorStoreForm from "./VectorStoreForm";

const localization = vi.hoisted(() => ({ language: "en" as "en" | "ru" }));

vi.mock("react-i18next", async () => {
  const { resources } = await import("@/i18n/catalog");
  const t = (key: string, values?: Record<string, unknown>) => {
    const copy = key.split(".").reduce<unknown>((value, segment) => {
      if (typeof value !== "object" || value === null) return undefined;
      return (value as Record<string, unknown>)[segment];
    }, resources[localization.language].gateway);
    const defaultValue = typeof values?.defaultValue === "string" ? values.defaultValue : key;
    const text = typeof copy === "string" ? copy : defaultValue;
    return Object.entries(values ?? {}).reduce(
      (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
      text,
    );
  };
  return {
    useTranslation: () => ({
      t,
      i18n: { language: localization.language, resolvedLanguage: localization.language },
    }),
  };
});

vi.mock("@/components/networking");

const renderForm = () =>
  render(
    <VectorStoreForm
      isVisible={true}
      onCancel={vi.fn()}
      onSuccess={vi.fn()}
      accessToken="test-token"
      credentials={[] as CredentialItem[]}
    />,
  );

describe("VectorStoreForm", () => {
  beforeEach(() => {
    localization.language = "en";
  });

  it("renders the form in Russian", () => {
    localization.language = "ru";
    renderForm();

    expect(screen.getByText("Добавление векторного хранилища")).toBeInTheDocument();
    expect(screen.getByText("Провайдер")).toBeInTheDocument();
    expect(screen.getByText("Название векторного хранилища")).toBeInTheDocument();
  });

  it("should render the form when visible", () => {
    renderForm();

    expect(screen.getByText("Add New Vector Store")).toBeInTheDocument();
  });

  it("renders the default provider's bundled logo via the shared Logo component", () => {
    renderForm();

    const logo = screen.getByRole("img", { name: `${VectorStoreProviders.Bedrock} logo` });
    expect(logo.getAttribute("src")).toBe(providerLogoMap[Providers.Bedrock]);
  });
});
