"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import LoadingScreen from "@/components/common_components/LoadingScreen";
import FocusVirtualKeysPage from "@/components/NewUI/FocusVirtualKeysPage";
import { Suspense } from "react";

function FocusVirtualKeysContent() {
  const { isLoading, isAuthorized } = useAuthorized();
  if (isLoading || !isAuthorized) return <LoadingScreen />;
  return <FocusVirtualKeysPage />;
}

export default function NewUIPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <FocusVirtualKeysContent />
    </Suspense>
  );
}
