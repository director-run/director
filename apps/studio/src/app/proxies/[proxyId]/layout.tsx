"use client";

import { Layout } from "@/app/design/components/layouts";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  return <Layout>{children}</Layout>;
}
