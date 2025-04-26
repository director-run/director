"use client";

import {
  DefaultLayout,
  DefaultLayoutContent,
  DefaultLayoutFooter,
} from "@/components/default-layout";
import { ManageLayoutHeader } from "@/components/manage-layout";
import { ManageFallback } from "@/components/manage/manage-fallback";
import { NoSSRSuspense } from "@/lib/no-ssr-suspense";

export default function DisconnectedLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <NoSSRSuspense fallback={<ManageFallback />}>
      <DefaultLayout>
        <ManageLayoutHeader />
        <DefaultLayoutContent>{children}</DefaultLayoutContent>
        <DefaultLayoutFooter />
      </DefaultLayout>
    </NoSSRSuspense>
  );
}
