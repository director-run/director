import { McpLogo } from "@/components/mcp-logo";
import { McpDescriptionList } from "@/components/mcp-servers/mcp-description-list";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { StoreServerTransport } from "@/components/types";
import { EmptyState, EmptyStateTitle } from "@/components/ui/empty-state";
import { Markdown } from "@/components/ui/markdown";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import Link from "next/link";

interface McpServerDetailProps {
  mcp: {
    name: string;
    transport: StoreServerTransport;
  };
  proxy: {
    id: string;
    name: string;
  };
  entryData: {
    icon?: string;
    readme?: string;
  };
  description?: string | null;
  toolLinks: Array<{
    title: string;
    subtitle: string;
    scroll: boolean;
    href: string;
    badges?: React.ReactNode;
  }>;
  toolsLoading: boolean;
}

export function McpServerDetail({
  mcp,
  proxy,
  entryData,
  description,
  toolLinks,
  toolsLoading,
}: McpServerDetailProps) {
  return (
    <>
      <Section>
        <McpLogo src={entryData?.icon} className="size-9" />
        <SectionHeader>
          <SectionTitle>{mcp.name}</SectionTitle>
          <SectionDescription>
            Installed on{" "}
            <Link href={`/${proxy.id}`} className="text-fg">
              {proxy?.name}
            </Link>
          </SectionDescription>
        </SectionHeader>

        {description ? <Markdown>{description}</Markdown> : null}
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h3>Transport</h3>
          </SectionTitle>
        </SectionHeader>

        <McpDescriptionList transport={mcp.transport} />
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h3>Tools</h3>
          </SectionTitle>
        </SectionHeader>

        <McpToolsTable links={toolLinks} isLoading={toolsLoading} />
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h3>Readme</h3>
          </SectionTitle>
        </SectionHeader>
        {entryData.readme ? (
          <div className="rounded-md border-[0.5px] bg-accent-subtle/20 px-4 py-8">
            <Markdown className="mx-auto">{entryData.readme}</Markdown>
          </div>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No readme found</EmptyStateTitle>
          </EmptyState>
        )}
      </Section>
    </>
  );
}
