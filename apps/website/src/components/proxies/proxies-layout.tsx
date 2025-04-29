"use client";

import Link from "next/link";

import { SimpleLogo } from "../ui/logo";
import { ProxySelector } from "./proxy-selector";

export function ProxiesLayoutHeader() {
  return (
    <header className="sticky top-2 z-50 flex justify-between gap-x-0.5">
      <nav className="flex w-full flex-row gap-x-0.5">
        <Link href="/">
          <SimpleLogo className="size-7 hover:text-primary-hover" />
        </Link>

        <ProxySelector />
      </nav>
    </header>
  );
}
