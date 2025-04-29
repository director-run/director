"use client";

import Link from "next/link";

import { ArrowLeftIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useConnectContext } from "../connect/connect-context";
import { Button } from "../ui/button";
import { SimpleLogo } from "../ui/logo";
import { ProxySelector } from "./proxy-selector";

function ExtraActions() {
  const { proxies } = useConnectContext();
  const { proxyId } = useParams<{ proxyId: string }>();
  const pathname = usePathname();

  if (pathname.includes("/settings")) {
    return (
      <Button size="icon" asChild>
        <Link href={`/proxies/${proxyId}`}>
          <ArrowLeftIcon />
          <span className="sr-only">Back</span>
        </Link>
      </Button>
    );
  }

  if (pathname.includes("/new") && proxies.length > 0) {
    return (
      <Button asChild>
        <Link href="/proxies">Cancel</Link>
      </Button>
    );
  }

  return null;
}

export function ProxiesLayoutHeader() {
  return (
    <header className="sticky top-2 z-50 flex justify-between gap-x-0.5">
      <nav className="flex w-full flex-row gap-x-0.5">
        <Link href="/">
          <SimpleLogo className="size-7 hover:text-primary-hover" />
        </Link>

        <ExtraActions />
        <ProxySelector />
      </nav>
    </header>
  );
}
