import React from "react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Form } from "antd";
import PassthroughAuthorizeSection from "./PassthroughAuthorizeSection";

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

const WithForm: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [form] = Form.useForm();
  return <Form form={form}>{children}</Form>;
};

const noopFlow = { startOAuthFlow: () => {}, status: "idle", error: null, tokenResponse: null };

describe("PassthroughAuthorizeSection credential-class-aware copy", () => {
  beforeEach(() => {
    localization.language = "en";
  });

  it("renders passthrough authorization in Russian", () => {
    localization.language = "ru";
    render(
      <WithForm>
        <PassthroughAuthorizeSection authType="true_passthrough" oauthFlow={noopFlow} />
      </WithForm>,
    );

    expect(screen.getByText("ID клиента OAuth (необязательно)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /авторизоваться и получить инструменты/i })).toBeInTheDocument();
  });

  it("shows keep-existing copy when the credential class is unchanged (true_passthrough <-> oauth_delegate)", () => {
    render(
      <WithForm>
        <PassthroughAuthorizeSection
          authType="oauth_delegate"
          oauthFlow={noopFlow}
          isEditing
          savedAuthType="true_passthrough"
        />
      </WithForm>,
    );
    expect(screen.getByPlaceholderText("Leave blank to keep the currently saved app (if any)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Leave blank to keep the currently saved secret (if any)")).toBeInTheDocument();
  });

  it("shows the discard warning copy when switching from a different class (oauth2 -> true_passthrough)", () => {
    render(
      <WithForm>
        <PassthroughAuthorizeSection
          authType="true_passthrough"
          oauthFlow={noopFlow}
          isEditing
          savedAuthType="oauth2"
        />
      </WithForm>,
    );
    expect(screen.getByPlaceholderText("Leave blank to use dynamic client registration")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Leave blank for public clients / PKCE")).toBeInTheDocument();
    expect(screen.getByText(/Changing the authentication type discards the saved app/)).toBeInTheDocument();
  });

  it("shows the keep+warn banner when the upstream may no longer match", () => {
    render(
      <WithForm>
        <PassthroughAuthorizeSection authType="true_passthrough" oauthFlow={noopFlow} appMayNotMatchUpstream />
      </WithForm>,
    );
    expect(screen.getByText(/upstream URL or endpoints changed/)).toBeInTheDocument();
  });
});
