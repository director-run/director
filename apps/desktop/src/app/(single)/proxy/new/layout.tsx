"use client";

import Link from "next/link";

import {
  GlobalLayoutContent,
  GlobalLayoutHeader,
} from "@/components/global-layout";
import { Button } from "@/components/ui/button";

export default function ProxyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalLayoutHeader className="justify-end">
        <Button variant="ghost" asChild>
          <Link href="/">Cancel</Link>
        </Button>
      </GlobalLayoutHeader>
      <GlobalLayoutContent className="items-center justify-center pt-4 pb-14">
        {children}
      </GlobalLayoutContent>
    </>
  );
}
