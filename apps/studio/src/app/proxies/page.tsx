"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { ProxyCardList } from "@/components/proxies/proxy-card-list";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";

export default function ProxiesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col justify-between gap-y-12 p-8">
      <Logo className="size-10" />

      <Section className="max-w-lg grow">
        <SectionHeader>
          <SectionTitle>Your proxies</SectionTitle>
          <SectionDescription>
            Create and manage your proxies.
          </SectionDescription>
        </SectionHeader>

        <ProxyCardList />
      </Section>

      <Button size="lg" className="-rotate-4 w-fit" asChild>
        <Link href="/proxies/new">
          <PlusIcon />
          <span>Add proxy</span>
        </Link>
      </Button>
    </div>
  );
}
