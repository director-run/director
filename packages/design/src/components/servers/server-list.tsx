import type { PlaybookTarget } from "../types.ts";
import { BadgeGroup } from "../ui/badge.tsx";
import { Button } from "../ui/button.tsx";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "../ui/empty-state.tsx";
import * as List from "../ui/list.tsx";
import { Section, SectionHeader, SectionTitle } from "../ui/section.tsx";
import { ServerStatusBadge } from "./server-status-badge.tsx";

export function PlaybookServerList({
  servers,
  onClickServer,
  onClickAddServer,
  onClickAuthorize,
}: {
  servers: PlaybookTarget[];
  onClickServer?: (server: PlaybookTarget) => void;
  onClickAddServer?: () => void;
  onClickAuthorize?: (server: PlaybookTarget) => void;
}) {
  return (
    <Section>
      <SectionHeader className="flex flex-row items-center justify-between">
        <SectionTitle variant="h2" asChild>
          <h2>Servers</h2>
        </SectionTitle>
        {onClickAddServer && (
          <Button size="sm" onClick={onClickAddServer}>
            Add MCP server
          </Button>
        )}
      </SectionHeader>
      {servers.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No items</EmptyStateTitle>
          <EmptyStateDescription>This list is empty.</EmptyStateDescription>
        </EmptyState>
      ) : (
        <List.List>
          {servers.map((server) => (
            <PlaybookServerListItem
              key={`li-${server.name}`}
              server={server}
              onClick={onClickServer && (() => onClickServer(server))}
              onClickAuthorize={onClickAuthorize}
            />
          ))}
        </List.List>
      )}
    </Section>
  );
}

function PlaybookServerListItem({
  server,
  onClick,
  onClickAuthorize,
}: {
  server: PlaybookTarget;
  onClick?: () => void;
  onClickAuthorize?: (server: PlaybookTarget) => void;
}) {
  return (
    <List.ListItem onClick={onClick}>
      <List.ListItemDetails>
        <List.ListItemTitle>{server.name}</List.ListItemTitle>
        <PlaybookServerListItemDescription server={server} />
      </List.ListItemDetails>
      <BadgeGroup>
        <ServerStatusBadge
          server={server}
          onClickAuthorize={onClickAuthorize}
        />
      </BadgeGroup>
    </List.ListItem>
  );
}

function PlaybookServerListItemDescription({
  server,
}: { server: PlaybookTarget }) {
  if (server.type === "http") {
    return <List.ListItemDescription>{server.url}</List.ListItemDescription>;
  } else if (server.type === "stdio") {
    return (
      <List.ListItemDescription>
        {server.command} {server.args.join(" ")}
      </List.ListItemDescription>
    );
  } else {
    return <List.ListItemDescription>--</List.ListItemDescription>;
  }
}
