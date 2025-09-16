import {
  ArrowSquareOutIcon,
  BookOpenTextIcon,
  HardDriveIcon,
  SealCheckIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import { McpLogo } from "./mcp-logo";
import { McpDescriptionList } from "./mcp-servers/mcp-description-list";
import { RegistryParameters } from "./registry/registry-parameters";
import { RegistryTools } from "./registry/registry-tools";
import type { MasterRegistryEntry } from "./types";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "./ui/badge";
import { EmptyState, EmptyStateTitle } from "./ui/empty-state";
import { Markdown } from "./ui/markdown";
import { Section, SectionHeader, SectionTitle } from "./ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface RegistryItemProps {
  entry: MasterRegistryEntry;
  onToolClick?: (
    tool: NonNullable<MasterRegistryEntry["tools"]>[number],
  ) => void;
}

export function RegistryItem({ entry, onToolClick }: RegistryItemProps) {
  return (
    <Section className="gap-y-8">
      <McpLogo src={entry.icon} className="size-9" />
      <SectionHeader>
        <SectionTitle>{entry.title}</SectionTitle>
        <p className="text-muted-foreground">{entry.description}</p>
      </SectionHeader>

      <BadgeGroup>
        {entry.isOfficial && (
          <Badge variant="success">
            <BadgeIcon>
              <SealCheckIcon />
            </BadgeIcon>
            <BadgeLabel uppercase>Official</BadgeLabel>
          </Badge>
        )}

        {entry.homepage && (
          <Badge
            className="transition-opacity duration-200 hover:opacity-50"
            asChild
          >
            <a href={entry.homepage} target="_blank" rel="noopener noreferrer">
              <BadgeIcon>
                <ArrowSquareOutIcon weight="bold" />
              </BadgeIcon>
              <BadgeLabel uppercase>Homepage</BadgeLabel>
            </a>
          </Badge>
        )}
      </BadgeGroup>

      <Tabs defaultValue="readme">
        <TabsList>
          <TabsTrigger value="readme">
            <BookOpenTextIcon /> Readme
          </TabsTrigger>
          <TabsTrigger value="tools">
            <ToolboxIcon /> Tools
          </TabsTrigger>
          <TabsTrigger value="transport">
            <HardDriveIcon /> Transport
          </TabsTrigger>
        </TabsList>

        <TabsContent value="readme">
          {entry.readme ? (
            <Markdown className="!max-w-none rounded-xl border-[0.5px] bg-accent-subtle/20 p-6">
              {entry.readme}
            </Markdown>
          ) : (
            <EmptyState>
              <EmptyStateTitle>No readme found</EmptyStateTitle>
            </EmptyState>
          )}
        </TabsContent>

        <TabsContent
          value="tools"
          className="rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
        >
          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Tools</h3>
              </SectionTitle>
            </SectionHeader>
            <RegistryTools
              links={(entry.tools ?? [])
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((tool) => ({
                  title: tool.name,
                  subtitle: tool.description?.replace(/\[([^\]]+)\]/g, ""),
                  scroll: false,
                  href: "#",
                  onClick: () => onToolClick?.(tool),
                }))}
            />
          </Section>
        </TabsContent>

        <TabsContent
          value="transport"
          className="flex flex-col gap-y-10 rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
        >
          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Overview</h3>
              </SectionTitle>
            </SectionHeader>
            <McpDescriptionList transport={entry.transport} />
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Parameters</h3>
              </SectionTitle>
            </SectionHeader>
            <RegistryParameters parameters={entry.parameters ?? []} />
          </Section>
        </TabsContent>
      </Tabs>
    </Section>
  );
}
