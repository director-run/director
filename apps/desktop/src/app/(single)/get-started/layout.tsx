"use client";

import { GlobalLayoutContent } from "@/components/global-layout";

export default function ProxyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalLayoutContent className="items-center justify-center py-14">
      {children}
    </GlobalLayoutContent>
  );
}
