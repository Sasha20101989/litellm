import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { credentialListCall, vectorStoreInfoCall } from "@/components/networking";

import VectorStoreInfoView from "./vector_store_info";

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
  vectorStoreInfoCall: vi.fn(),
  vectorStoreUpdateCall: vi.fn(),
  credentialListCall: vi.fn(),
}));

vi.mock("./VectorStoreTester", () => ({ __esModule: true, default: () => null }));

const mockVectorStoreInfoCall = vi.mocked(vectorStoreInfoCall);
const mockCredentialListCall = vi.mocked(credentialListCall);

describe("VectorStoreInfoView", () => {
  beforeEach(() => {
    localization.language = "en";
    vi.clearAllMocks();
    mockCredentialListCall.mockResolvedValue({ credentials: [] });
  });

  it("renders vector store details in Russian", async () => {
    localization.language = "ru";
    mockVectorStoreInfoCall.mockResolvedValue({
      vector_store: {
        vector_store_id: "vs-1",
        vector_store_name: "support-docs-store",
        custom_llm_provider: "bedrock",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    });

    render(
      <VectorStoreInfoView
        vectorStoreId="vs-1"
        onClose={vi.fn()}
        accessToken="sk-test"
        is_admin={true}
        editVectorStore={false}
      />,
    );

    expect(await screen.findByText("ID векторного хранилища: vs-1")).toBeInTheDocument();
    expect(screen.getByText("Сведения о векторном хранилище")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Изменить хранилище" })).toHaveLength(2);
  });

  it("should render the store details once the fetch resolves", async () => {
    mockVectorStoreInfoCall.mockResolvedValue({
      vector_store: {
        vector_store_id: "vs-1",
        vector_store_name: "support-docs-store",
        custom_llm_provider: "bedrock",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    });
    render(
      <VectorStoreInfoView
        vectorStoreId="vs-1"
        onClose={vi.fn()}
        accessToken="sk-test"
        is_admin={true}
        editVectorStore={false}
      />,
    );
    expect(await screen.findByText("Vector Store ID: vs-1")).toBeInTheDocument();
  });

  it("should show a not-found state with a working back button when the fetch fails instead of loading forever", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mockVectorStoreInfoCall.mockRejectedValue(new Error("Vector store not found"));
    render(
      <VectorStoreInfoView
        vectorStoreId="vs-gone"
        onClose={onClose}
        accessToken="sk-test"
        is_admin={true}
        editVectorStore={false}
      />,
    );
    expect(await screen.findByText("Vector store not found")).toBeInTheDocument();
    expect(screen.getByText(/vs-gone could not be loaded/)).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Back to Vector Stores/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it("should show the not-found state when the fetch resolves without a vector store", async () => {
    mockVectorStoreInfoCall.mockResolvedValue({ vector_store: null });
    render(
      <VectorStoreInfoView
        vectorStoreId="vs-gone"
        onClose={vi.fn()}
        accessToken="sk-test"
        is_admin={true}
        editVectorStore={false}
      />,
    );
    expect(await screen.findByText("Vector store not found")).toBeInTheDocument();
  });
});
