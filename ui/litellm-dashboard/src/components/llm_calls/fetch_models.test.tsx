import { beforeEach, describe, expect, it, vi } from "vitest";
import { modelAvailableCall, modelHubCall } from "@/components/networking";
import { fetchAvailableModels, fetchAvailableModelsForTeam } from "./fetch_models";

vi.mock("@/components/networking", () => ({
  modelAvailableCall: vi.fn(),
  modelHubCall: vi.fn(),
}));

const modelAvailableCallMock = vi.mocked(modelAvailableCall);
const modelHubCallMock = vi.mocked(modelHubCall);

describe("fetchAvailableModels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides routing wildcards that cannot be selected as chat model IDs", async () => {
    modelHubCallMock.mockResolvedValue({
      data: [
        { model_group: "openrouter/*", mode: "chat" },
        { model_group: "openrouter/openrouter/free", mode: "chat" },
        { model_group: "openrouter/openai/gpt-5", mode: "chat" },
      ],
    });

    await expect(fetchAvailableModels("token")).resolves.toEqual([
      { model_group: "openrouter/openai/gpt-5", mode: "chat" },
      { model_group: "openrouter/openrouter/free", mode: "chat" },
    ]);
  });
});

describe("fetchAvailableModelsForTeam", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the models scoped to the team so team-only BYOK models are included", async () => {
    modelAvailableCallMock.mockResolvedValue({
      data: [{ id: "all-proxy-models" }, { id: "openai/*" }, { id: "gpt-5-mini" }, { id: "openai/*" }],
    });

    const models = await fetchAvailableModelsForTeam("token", "team-123");

    expect(modelAvailableCallMock).toHaveBeenCalledWith("token", "", "", false, "team-123");
    expect(models).toEqual([{ model_group: "gpt-5-mini" }, { model_group: "openai/*" }]);
  });

  it("returns an empty list when the team has no models", async () => {
    modelAvailableCallMock.mockResolvedValue({ data: [] });

    expect(await fetchAvailableModelsForTeam("token", "team-123")).toEqual([]);
  });
});
