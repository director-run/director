"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { trpc } from "@/trpc/client";

function ProxyNavigation() {
  const params = useParams<{ proxyId: string }>();
  const { data: proxies, isLoading: proxiesIsLoading } =
    trpc.store.getAll.useQuery();

  if (proxiesIsLoading) {
    return (
      <div className="flex grow flex-col gap-y-2">
        <Button variant="secondary" className="w-fit" disabled>
          <span>Loading...</span>
        </Button>
        <Button variant="secondary" className="w-fit" disabled>
          <span>Loading...</span>
        </Button>
        <Button variant="secondary" className="w-fit" disabled>
          <span>Loading...</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex grow flex-col gap-y-2">
      {proxies?.map((it) => {
        const isActive = it.id === params.proxyId;
        return (
          <Button
            key={it.id}
            variant={isActive ? "default" : "secondary"}
            className="w-fit"
            asChild
          >
            <Link href={`/proxies/${it.id}`}>
              <span>{it.name}</span>
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

export default function ProxyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-row overflow-hidden">
      <div className="flex flex-col justify-between gap-y-12 p-6">
        <Logo />

        <ProxyNavigation />

        <Button className="-rotate-4 w-fit" asChild>
          <Link href="/proxies/new">
            <PlusIcon />
            <span>Add proxy</span>
          </Link>
        </Button>
      </div>
      <div className="h-full grow overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
