"use client";

import { useConnectContext } from "@/components/connect/connect-context";
import { ManageRedirect } from "@/components/manage/manage-redirect";

export default function Manage() {
  const { selectedProxy } = useConnectContext();

  if (!selectedProxy) {
    return <ManageRedirect />;
  }

  return <div>Manage {selectedProxy.name}</div>;
}
