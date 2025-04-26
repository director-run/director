"use client";

import Link from "next/link";

import { ProxySelector } from "./manage/proxy-selector";
import { SimpleLogo } from "./ui/logo";

export function ManageLayoutHeader() {
  return (
    <header className="flex justify-between gap-x-0.5">
      <nav className="flex w-full flex-row gap-x-0.5">
        <Link href="/">
          <SimpleLogo className="size-7 hover:text-primary-hover" />
        </Link>

        <ProxySelector />
      </nav>
    </header>
  );
}
