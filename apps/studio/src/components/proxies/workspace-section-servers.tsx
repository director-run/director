import { MCPLinkCard, MCPLinkCardList } from "../mcp-servers/mcp-link-card";
import type { MasterWorkspace } from "../types";
import { Button } from "../ui/button";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

export interface WorkspaceSectionServersProps {
  workspace: MasterWorkspace;
  onLibraryClick?: () => void;
  onServerClick?: (serverId: string) => void;
}

export function WorkspaceSectionServers({
  workspace,
  onLibraryClick,
  onServerClick,
}: WorkspaceSectionServersProps) {
  return (
    <Section>
      <SectionHeader className="flex flex-row items-center justify-between">
        <SectionTitle variant="h2" asChild>
          <h2>MCP Servers</h2>
        </SectionTitle>
        <Button size="sm" onClick={onLibraryClick}>
          Add MCP server
        </Button>
      </SectionHeader>
      <MCPLinkCardList>
        {workspace.servers.map((it) => {
          return (
            <MCPLinkCard
              key={it.name}
              entry={{
                title: it.name,
                description: null,
                icon: null,
                isOfficial: false,
              }}
              onClick={() => onServerClick?.(it.name)}
            />
          );
        })}
      </MCPLinkCardList>
    </Section>
  );
}
