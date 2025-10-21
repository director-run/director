import { MCPLinkCard, MCPLinkCardList } from "../mcp-servers/mcp-link-card";
import type { PlaybookDetail } from "../types";
import { Button } from "../ui/button";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

export interface PlaybookSectionServersProps {
  playbook: PlaybookDetail;
  onLibraryClick?: () => void;
  onServerClick?: (serverId: string) => void;
}

export function PlaybookSectionServers({
  playbook,
  onLibraryClick,
  onServerClick,
}: PlaybookSectionServersProps) {
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
        {playbook.servers.map((it) => {
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
