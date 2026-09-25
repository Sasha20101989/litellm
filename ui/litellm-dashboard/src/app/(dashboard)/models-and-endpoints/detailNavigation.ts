import { parseAsString, useQueryState, useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo } from "react";

export type ModelDetailTarget =
  | { kind: "none"; id: null }
  | { kind: "model"; id: string }
  | { kind: "team"; id: string };

export interface ModelDetailRouting {
  modelId: string | null;
  teamId: string | null;
  selectedTarget: ModelDetailTarget;
  openModel: (id: string) => void;
  openTeam: (id: string) => void;
  close: () => void;
}

export function useModelDetailRouting(): ModelDetailRouting {
  const [{ model, team }, setParams] = useQueryStates(
    { model: parseAsString, team: parseAsString },
    { history: "push" },
  );

  // Team was the legacy page's explicit precedence. Preserve that meaning for
  // shared hand-authored links, then clean the redundant selector once.
  useEffect(() => {
    if (model && team) {
      void setParams({ model: null, team }, { history: "replace" });
    }
  }, [model, setParams, team]);

  const selectedTarget = useMemo<ModelDetailTarget>(() => {
    if (team) return { kind: "team", id: team };
    if (model) return { kind: "model", id: model };
    return { kind: "none", id: null };
  }, [model, team]);

  const openModel = useCallback(
    (id: string) => {
      void setParams({ model: id, team: null });
    },
    [setParams],
  );

  const openTeam = useCallback(
    (id: string) => {
      void setParams({ model: null, team: id });
    },
    [setParams],
  );

  const close = useCallback(() => {
    void setParams({ model: null, team: null });
  }, [setParams]);

  return {
    modelId: selectedTarget.kind === "model" ? selectedTarget.id : null,
    teamId: selectedTarget.kind === "team" ? selectedTarget.id : null,
    selectedTarget,
    openModel,
    openTeam,
    close,
  };
}

export interface ModelGroupFilterRouting {
  modelGroup: string | null;
  setModelGroup: (modelGroup: string | null) => void;
}

export function useModelGroupFilterRouting(): ModelGroupFilterRouting {
  const [modelGroup, setParam] = useQueryState("model_group", parseAsString);

  const setModelGroup = useCallback(
    (next: string | null) => {
      void setParam(next);
    },
    [setParam],
  );

  return { modelGroup, setModelGroup };
}
