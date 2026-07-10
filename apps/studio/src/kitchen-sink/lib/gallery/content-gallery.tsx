import { MCPLinkCard } from "@director.run/design/components/mcp-servers/mcp-link-card.tsx";
import { MCPLinkCardList } from "@director.run/design/components/mcp-servers/mcp-link-card.tsx";
import { PlaybookTargetPropertyList } from "@director.run/design/components/mcp-servers/playbook-target-property-list.tsx";
import { RegistryEntryPropertyList } from "@director.run/design/components/registry/registry-entry-property-list.tsx";
import { RegistryParameters } from "@director.run/design/components/registry/registry-parameters.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/design/components/split-view.tsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@director.run/design/components/ui/breadcrumb.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@director.run/design/components/ui/empty-state.tsx";
import { JSONSchema } from "@director.run/design/components/ui/json-schema.tsx";
import {
  List,
  ListItem,
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "@director.run/design/components/ui/list.tsx";
import { Markdown } from "@director.run/design/components/ui/markdown.tsx";
import { SimpleMarkdown } from "@director.run/design/components/ui/markdown.tsx";
import {
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuLabel,
} from "@director.run/design/components/ui/menu.tsx";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@director.run/design/components/ui/section.tsx";
import { Tab, Tabs } from "@director.run/design/components/ui/tabs.tsx";
import { mockPlaybookTarget } from "@director.run/design/test/fixtures/playbook/playbook-target.ts";
import { mockRegistryEntryList } from "@director.run/design/test/fixtures/registry/entry-list.ts";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import { GallerySection } from "./gallery-section";

const CONTAINER_SIZES = ["sm", "md", "lg"] as const;

const sampleMarkdown = [
  "## Markdown",
  "",
  "Supports **bold**, _italic_, `code` and lists:",
  "",
  "- First item",
  "- Second item",
].join("\n");

const sampleSchema = {
  type: "object",
  required: ["query"],
  properties: {
    query: { type: "string", description: "The search query" },
    limit: { type: "number", description: "Maximum results", default: 10 },
    includeArchived: {
      type: "boolean",
      description: "Include archived items",
    },
  },
};

export function ContentGallery() {
  return (
    <div className="flex flex-col gap-y-12">
      <GallerySection
        title="Containers"
        description="Width-constraining wrappers by size."
      >
        <div className="flex flex-col gap-y-2">
          {CONTAINER_SIZES.map((size) => (
            <Container key={size} size={size}>
              <div className="rounded-lg border border-accent bg-accent-subtle p-3 text-center text-fg-subtle text-xs">
                Container size="{size}"
              </div>
            </Container>
          ))}
        </div>
      </GallerySection>

      <GallerySection
        title="Sections, lists & empty state"
        description="The building blocks for most pages."
      >
        <Section>
          <SectionHeader>
            <SectionTitle variant="h2" asChild>
              <h3>Section title</h3>
            </SectionTitle>
            <SectionDescription>
              A section groups related content under a heading.
            </SectionDescription>
          </SectionHeader>
          <List>
            <ListItem>
              <ListItemDetails>
                <ListItemTitle>List item</ListItemTitle>
                <ListItemDescription>
                  With a title and a description.
                </ListItemDescription>
              </ListItemDetails>
            </ListItem>
            <ListItem onClick={() => undefined}>
              <ListItemDetails>
                <ListItemTitle>Clickable item</ListItemTitle>
                <ListItemDescription>
                  Hover to see the interactive treatment.
                </ListItemDescription>
              </ListItemDetails>
            </ListItem>
          </List>
          <SectionSeparator />
          <EmptyState>
            <EmptyStateTitle>No items</EmptyStateTitle>
            <EmptyStateDescription>This list is empty.</EmptyStateDescription>
          </EmptyState>
        </Section>
      </GallerySection>

      <GallerySection title="Navigation">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Library</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>GitHub</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Tabs default="one">
          <Tab
            id="one"
            label="First tab"
            content={<p className="text-fg-subtle text-sm">First panel.</p>}
          />
          <Tab
            id="two"
            label="Second tab"
            content={<p className="text-fg-subtle text-sm">Second panel.</p>}
          />
        </Tabs>

        <div className="max-w-[220px]">
          <Menu>
            <MenuLabel label="Playbooks" />
            <MenuItem data-state="active">
              <MenuItemLabel>Active item</MenuItemLabel>
            </MenuItem>
            <MenuItem>
              <MenuItemLabel>Another item</MenuItemLabel>
            </MenuItem>
          </Menu>
        </div>
      </GallerySection>

      <GallerySection title="Rich content">
        <div className="flex flex-col gap-y-6">
          <Markdown>{sampleMarkdown}</Markdown>
          <SimpleMarkdown>
            {"Inline **bold**, _italic_ and `code` only."}
          </SimpleMarkdown>
          <JSONSchema schema={sampleSchema} />
        </div>
      </GallerySection>

      <GallerySection
        title="Domain cards & property lists"
        description="Composite components used across playbooks and the registry."
      >
        <MCPLinkCardList>
          {mockRegistryEntryList.slice(0, 4).map((entry) => (
            <MCPLinkCard
              key={entry.id}
              entry={entry}
              onClick={() => undefined}
            />
          ))}
        </MCPLinkCardList>
        <RegistryEntryPropertyList entry={mockRegistryEntry} />
        <RegistryParameters parameters={mockRegistryEntry.parameters} />
        <PlaybookTargetPropertyList target={mockPlaybookTarget} />
        <SplitView>
          <SplitViewMain>
            <div className="rounded-lg border border-accent bg-accent-subtle p-4 text-fg-subtle text-sm">
              Split view — main column
            </div>
          </SplitViewMain>
          <SplitViewSide>
            <div className="rounded-lg border border-accent bg-accent-subtle p-4 text-fg-subtle text-sm">
              Side column (hidden below lg)
            </div>
          </SplitViewSide>
        </SplitView>
      </GallerySection>
    </div>
  );
}
