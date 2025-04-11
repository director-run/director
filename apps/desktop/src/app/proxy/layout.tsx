"use client";

import {
  GlobalLayoutContent,
  GlobalLayoutHeader,
} from "@/components/global-layout";

import { ProxySelector } from "@/components/proxy/proxy-selector";
import { Button } from "@/components/ui/button";

export default function ProxyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalLayoutHeader>
        <ProxySelector />
        <div className="flex flex-row gap-x-2">
          <Button variant="ghost">Settings</Button>
        </div>
      </GlobalLayoutHeader>
      <GlobalLayoutContent className="items-center justify-center pt-4 pb-14">
        {children}
      </GlobalLayoutContent>
    </>
  );
}
