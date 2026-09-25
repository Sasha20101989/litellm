"use client";

import AllModelsTab from "@/app/(dashboard)/models-and-endpoints/components/AllModelsTab";
import { useModelDashboardData } from "@/app/(dashboard)/models-and-endpoints/useModelDashboardData";

export default function AllModelsPanel() {
  const { availableModelGroups, availableModelAccessGroups } = useModelDashboardData();
  return <AllModelsTab availableModelGroups={availableModelGroups} availableModelAccessGroups={availableModelAccessGroups} />;
}
