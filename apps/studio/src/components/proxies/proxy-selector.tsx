"use client";

import { ChevronDownIcon, PlusIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";

export function ProxySelector() {
  const router = useRouter();
  const params = useParams<{ proxyId: string }>();

  const { data, isLoading } = trpc.store.getAll.useQuery(undefined, {});

  if (isLoading || !data) {
    return (
      <Button>
        <Loader />
      </Button>
    );
  }

  const selectedProxy = data.find((proxy) => proxy.id === params.proxyId);

  return (
    <div className="flex items-center gap-x-0.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={cn("gap-x-1.5 pr-2 [&>svg]:size-3")}>
            <span className="block truncate">
              {selectedProxy?.name ?? "Select a proxy"}
            </span>
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={selectedProxy?.id ?? undefined}
            onValueChange={(value) => {
              router.push(`/proxies/${value}`);
            }}
          >
            {data.map((proxy) => (
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

      {selectedProxy && (
        <Button variant="secondary" size="icon" asChild>
          <Link href={`/proxies/${selectedProxy.id}/settings`}>
            <SettingsIcon />
          </Link>
        </Button>
      )}
    </div>
  );
}
