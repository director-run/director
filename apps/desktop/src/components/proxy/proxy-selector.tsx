"use client";
import { CaretDown, Plus } from "@phosphor-icons/react";
import Link from "next/link";

import {} from "@/components/providers/connection-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProxyContext } from "./proxy-context";

export function ProxySelector() {
  const { currentProxyId, currentProxy, proxyById } = useProxyContext();

  if (!currentProxy) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <span className="block max-w-[16ch] truncate">
            {currentProxy.name}
          </span>
          <CaretDown
            className="shrink-0 text-muted-foreground/70"
            weight="bold"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        className="min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-xs"
      >
        <DropdownMenuGroup className="min-w-0">
          {Object.values(proxyById).map((it) => {
            return (
              <DropdownMenuItem key={it.id} asChild>
                <Link
                  href={{
                    pathname: "/proxy",
                    query: { proxyId: it.id },
                  }}
                >
                  <span className="truncate">{it.name}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/new">
              <Plus />
              New server
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
