"use client";

import AllModelsTab from "@/app/(dashboard)/models-and-endpoints/components/AllModelsTab";
import { useModelFilterFacets } from "@/app/(dashboard)/hooks/models/useModels";

export default function AllModelsPanel() {
  const { availableModelGroups, availableModelGroupOptions, availableModelAccessGroups } = useModelFilterFacets();
  return <AllModelsTab availableModelGroups={availableModelGroups} availableModelGroupOptions={availableModelGroupOptions} availableModelAccessGroups={availableModelAccessGroups} />;
}
