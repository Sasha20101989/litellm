import type { RoutingGroup } from "./types";

export const groupNameByModel = (groups: RoutingGroup[], excludeGroupName?: string): Record<string, string> =>
  Object.fromEntries(
    groups
      .filter((group) => group.group_name !== excludeGroupName && group.routing_strategy !== "priority")
      .flatMap((group) => group.models.map((model) => [model, group.group_name] as const)),
  );

export interface ModelConflict {
  claims: Array<{ model: string; groupName: string }>;
}

export const modelConflict = (
  models: string[] | undefined,
  ownerByModel: Record<string, string>,
): ModelConflict | null => {
  const conflicts = (models ?? []).filter((model) => Object.hasOwn(ownerByModel, model));
  if (conflicts.length === 0) return null;
  return { claims: conflicts.map((model) => ({ model, groupName: ownerByModel[model] })) };
};
