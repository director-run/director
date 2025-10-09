import {
  ArrowSquareOutIcon,
  BookOpenTextIcon,
  HardDriveIcon,
  SealCheckIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import { McpLogo } from "./mcp-logo";
import { RegistryEntryPropertyList } from "./registry/registry-entry-property-list";
import { RegistryEntryReadme } from "./registry/registry-entry-readme";
import { RegistryParameters } from "./registry/registry-parameters";
import { ToolList } from "./tools/tool-list";
import type { RegistryEntryDetail } from "./types";
import type { MCPTool } from "./types";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "./ui/badge";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "./ui/section";
import { Tab, Tabs } from "./ui/tabs";

interface RegistryItemProps {
  entry: RegistryEntryDetail;
}

export function RegistryItem({ entry }: RegistryItemProps) {
  return (
    <Section className="gap-y-8">
      <McpLogo src={entry.icon} className="size-9" />
      <SectionHeader>
        <SectionTitle>{entry.title}</SectionTitle>
        <SectionDescription>{entry.description}</SectionDescription>
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

      <Tabs default="readme">
        <Tab
          id="readme"
          label="Readme"
          icon={<BookOpenTextIcon />}
          content={<RegistryEntryReadme readme={entry.readme} />}
        />
        <Tab
          id="tools"
          label="Tools"
          icon={<ToolboxIcon />}
          content={
            <ToolList tools={entry.tools as MCPTool[]} toolsLoading={false} />
          }
        />
        <Tab
          id="transport"
          label="Transport"
          icon={<HardDriveIcon />}
          content={
            <div className="flex flex-col gap-y-10">
              <Section>
                <SectionHeader>
                  <SectionTitle variant="h2" asChild>
                    <h3>Overview</h3>
                  </SectionTitle>
                </SectionHeader>
                <RegistryEntryPropertyList entry={entry} />
              </Section>

              <Section>
                <SectionHeader>
                  <SectionTitle variant="h2" asChild>
                    <h3>Parameters</h3>
                  </SectionTitle>
                </SectionHeader>
                <RegistryParameters parameters={entry.parameters ?? []} />
              </Section>
            </div>
          }
        />
      </Tabs>
    </Section>
  );
}
