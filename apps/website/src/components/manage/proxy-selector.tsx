"use client";

import { cn } from "@/lib/cn";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnectContext } from "../connect/connect-context";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ProxySelector() {
  const router = useRouter();
  const { proxies, selectedProxy } = useConnectContext();

  if (!selectedProxy) {
    return (
      <Button asChild>
        <Link href="/proxies">Go back</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={cn("gap-x-1.5 pr-2 [&>svg]:size-3")}>
          <span className="block truncate">{selectedProxy.name}</span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={selectedProxy.id}
          onValueChange={(value) => {
            router.push(`/proxies/${value}`);
          }}
        >
          {proxies.map((proxy) => (
            <DropdownMenuRadioItem value={proxy.id} key={proxy.id}>
              <span className="block truncate">{proxy.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/proxies/new">
            <PlusIcon />
            <span>Create new space</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
