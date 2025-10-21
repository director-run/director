import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { LayoutView } from "@director.run/design/components/layout/layout.tsx";
import { McpLogo } from "@director.run/design/components/mcp-logo.tsx";
import { PlaybookTargetPropertyList } from "@director.run/design/components/mcp-servers/playbook-target-property-list.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { PlaybookSkeleton } from "@director.run/design/components/playbooks/playbook-skeleton.tsx";
import { RegistryEntryReadme } from "@director.run/design/components/registry/registry-entry-readme.tsx";
import { ToolList } from "@director.run/design/components/tools/tool-list.js";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { Markdown } from "@director.run/design/components/ui/markdown.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { Tab, Tabs } from "@director.run/design/components/ui/tabs.tsx";
import {
  BookOpenTextIcon,
  HardDriveIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useListTools } from "../hooks/use-list-tools.ts";
import { usePlaybookTarget } from "../hooks/use-playbook-target.ts";
import { useRegistryEntry } from "../hooks/use-registry-entry.ts";
import { PlaybookTargetDetailDropDownMenu } from "./playbook-target-detail-dropdown-menu.tsx";

export function PlaybookTargetDetailPage() {
  const { playbookId, targetId } = useParams();
  const navigate = useNavigate();

  if (!playbookId || !targetId) {
    throw new Error("Playbook ID and target ID are required");
  }

  const {
    playbook,
    playbookTarget,
    isPlaybookTargetLoading,
    playbookTargetError,
  } = usePlaybookTarget(playbookId, targetId);

  const { tools, isToolsLoading } = useListTools(playbookId, targetId);
  const registryEntryQuery = useRegistryEntry({ entryName: targetId });
  const registryEntry = registryEntryQuery.data;

  if (isPlaybookTargetLoading) {
    return <PlaybookSkeleton />;
  }

  if (playbookTargetError || !playbookTarget || !playbook) {
    return (
      <FullScreenError
        icon="dead-smiley"
        fullScreen={true}
        title={"Unexpected Error"}
        subtitle={playbookTargetError?.toString() || "Unknown error"}
      />
    );
  }

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: playbook?.name || "",
            onClick: () => navigate(`/${playbookId}`),
          },
          {
            title: playbookTarget?.name,
          },
        ]}
      >
        <PlaybookTargetDetailDropDownMenu
          playbookTarget={playbookTarget}
          playbook={playbook}
        />
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="lg">
          <Section className="gap-y-8">
            <McpLogo src={registryEntry?.icon} className="size-9" />
            <SectionHeader>
              <SectionTitle>{playbookTarget.name}</SectionTitle>
              <SectionDescription>
                Installed on{" "}
                <button
                  onClick={() => navigate(`/${playbookId}`)}
                  className="cursor-pointer text-fg underline"
                >
                  {playbook?.name}
                </button>
              </SectionDescription>
            </SectionHeader>

            {registryEntry?.description ? (
              <Markdown>{registryEntry?.description}</Markdown>
            ) : null}
          </Section>

          <Tabs default="tools">
            <Tab
              id="readme"
              label="Readme"
              icon={<BookOpenTextIcon />}
              content={
                <RegistryEntryReadme readme={registryEntry?.readme ?? null} />
              }
            />
            <Tab
              id="tools"
              label="Tools"
              icon={<ToolboxIcon />}
              content={<ToolList tools={tools} toolsLoading={isToolsLoading} />}
            />
            <Tab
              id="properties"
              label="Properties"
              icon={<HardDriveIcon />}
              content={
                <Section>
                  <SectionHeader>
                    <SectionTitle variant="h2" asChild>
                      <h3>Transport Configuration</h3>
                    </SectionTitle>
                  </SectionHeader>
                  <PlaybookTargetPropertyList target={playbookTarget} />
                </Section>
              }
            />
          </Tabs>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
