"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import LoadingScreen from "@/components/common_components/LoadingScreen";
import FocusModelsAndEndpointsPage from "@/components/NewUI/FocusModelsAndEndpointsPage";
import { Suspense } from "react";

function FocusModelsAndEndpointsContent() {
  const { isLoading, isAuthorized } = useAuthorized();
  if (isLoading || !isAuthorized) return <LoadingScreen />;
  return <FocusModelsAndEndpointsPage />;
}

export default function FocusModelsAndEndpointsRoute() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <FocusModelsAndEndpointsContent />
    </Suspense>
  );
}
