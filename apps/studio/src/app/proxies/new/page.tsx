import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { NewProxyForm } from "@/components/proxies/proxy-form";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";

export default function NewProxyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col justify-between gap-y-12 p-8">
      <Logo className="size-10" />

      <Section className="max-w-xl grow">
        <SectionHeader>
          <SectionTitle>New proxy</SectionTitle>
          <SectionDescription>
            Create a new proxy to start using MCP.
          </SectionDescription>
        </SectionHeader>

        <NewProxyForm />
      </Section>

      <Button variant="secondary" size="lg" className="-rotate-4 w-fit" asChild>
        <Link href="/proxies">
          <ArrowLeftIcon />
          <span>Back to proxies</span>
        </Link>
      </Button>
    </div>
  );
}
