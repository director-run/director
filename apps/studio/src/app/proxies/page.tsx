"use client";

import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { DefaultFallback } from "@/lib/no-ssr-suspense";
import { trpc } from "@/trpc/client";

export default function ProxiesPage() {
  const { data, isLoading } = trpc.store.getAll.useQuery();

  if (isLoading || !data) {
    return <DefaultFallback />;
  }

  if (data.length === 0) {
    return redirect("/proxies/new");
  }

  return (
    <Container size="sm" className="py-12">
      <Section>
        <SectionHeader>
          <SectionTitle>Your proxies</SectionTitle>
          <SectionDescription>
            Create and manage your proxies.
          </SectionDescription>
        </SectionHeader>
        <div className="flex flex-col gap-y-2">
          {data.map((proxy) => (
            <Link key={proxy.id} href={`/proxies/${proxy.id}`}>
              <div>{proxy.name}</div>
              {proxy.description && <div>{proxy.description}</div>}
            </Link>
          ))}

          <Button asChild>
            <Link href="/proxies/new">Create new proxy</Link>
          </Button>
        </div>
      </Section>
    </Container>
  );
}
