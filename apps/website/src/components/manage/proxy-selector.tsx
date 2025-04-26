"use client";

import { cn } from "@/lib/cn";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useConnectContext } from "../connect/connect-context";
import { HeaderButton } from "../default-layout";
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
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <HeaderButton className={cn("gap-x-1.5 pr-2 [&>svg]:size-3")}>
          <span className="block truncate">{selectedProxy.name}</span>
          <ChevronDownIcon />
        </HeaderButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={selectedProxy.id}
          onValueChange={(value) => {
            router.push(`/manage/${value}`);
          }}
        >
          {proxies.map((proxy) => (
            <DropdownMenuRadioItem value={proxy.id} key={proxy.id}>
              <span className="block truncate">{proxy.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <PlusIcon />
          <span>Create new space</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
