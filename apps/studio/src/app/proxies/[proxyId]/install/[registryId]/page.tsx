"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { getDeterministicColor } from "@/lib/deterministic-colors";
import { trpc } from "@/trpc/client";
import { GlobeIcon } from "lucide-react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { McpInstallForm } from "@/components/mcp-servers/mcp-install-form";
import { useParams } from "next/navigation";

export default function RegistryEntryPage() {
  const params = useParams<{ proxyId: string; registryId: string }>();

  const { data: entry, isLoading } = trpc.registry.getEntryByName.useQuery({
    name: params.registryId,
  });

  if (isLoading) {
    return <div>Loading…</div>;
  }

  if (!entry) {
    return <div>Not found</div>;
  }

  const hasConfiguration = Object.keys(entry?.parameters ?? {}).length > 0;

  return (
    <Container size="lg">
      <Section>
        <SectionHeader>
          <SectionTitle>{entry?.title}</SectionTitle>
          <SectionDescription>{entry?.description}</SectionDescription>
        </SectionHeader>
        <div className="flex items-center gap-x-1">
          {entry?.isOfficial && (
            <Badge variant={getDeterministicColor("official")}>Official</Badge>
          )}

          <Badge variant={getDeterministicColor(entry?.transport.type ?? "")}>
            {entry?.transport.type}
          </Badge>

          {entry?.transport.type === "stdio" && (
            <Badge variant={getDeterministicColor(entry?.transport.command)}>
              {entry?.transport.command}
            </Badge>
          )}

          {entry?.homepage && (
            <Button className="ml-auto h-6" asChild>
              <a
                href={entry.homepage}
                rel="noopener noreferrer"
                target="_blank"
              >
                <GlobeIcon className="h-4 w-4" />
                <span>Homepage</span>
              </a>
            </Button>
          )}
        </div>
      </Section>
      <SectionSeparator />

      <McpInstallForm proxyId={params.proxyId} entry={entry} />

      <SectionSeparator />
      {entry?.readme ? (
        <Section>
          <div>
            <Markdown
              components={{
                h1: ({ children }) => (
                  <h1 className="font-bold text-2xl">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-bold text-xl">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-bold text-lg">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="font-bold text-base">{children}</h4>
                ),
                h5: ({ children }) => (
                  <h5 className="font-bold text-sm">{children}</h5>
                ),
              }}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {entry?.readme ?? ""}
            </Markdown>
          </div>
        </Section>
      ) : (
        <Section>
          <SectionHeader>
            <SectionTitle>No README</SectionTitle>
            <SectionDescription>
              This entry does not have a README.
            </SectionDescription>
          </SectionHeader>
        </Section>
      )}
    </Container>
  );
}
