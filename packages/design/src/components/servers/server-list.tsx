import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { WorkspaceTarget } from "../types.ts";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "../ui/badge.tsx";
import { Button } from "../ui/button.tsx";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "../ui/empty-state.tsx";
import * as List from "../ui/list.tsx";
import { Section, SectionHeader, SectionTitle } from "../ui/section.tsx";

export function WorkspaceServerList({
  servers,
  onClickServer,
  onClickAddServer,
  onClickAuthorize,
}: {
  servers: WorkspaceTarget[];
  onClickServer?: (server: WorkspaceTarget) => void;
  onClickAddServer?: () => void;
  onClickAuthorize?: (server: WorkspaceTarget) => void;
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
            <WorkspaceServerListItem
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

function WorkspaceServerListItem({
  server,
  onClick,
  onClickAuthorize,
}: {
  server: WorkspaceTarget;
  onClick?: () => void;
  onClickAuthorize?: (server: WorkspaceTarget) => void;
}) {
  return (
    <List.ListItem onClick={onClick}>
      <List.ListItemDetails>
        <List.ListItemTitle>{server.name}</List.ListItemTitle>
        <WorkspaceServerListItemDescription server={server} />
      </List.ListItemDetails>
      <BadgeGroup>
        <WorkspaceServerListItemStatus
          server={server}
          onClickAuthorize={onClickAuthorize}
        />
      </BadgeGroup>
    </List.ListItem>
  );
}

function WorkspaceServerListItemDescription({
  server,
}: { server: WorkspaceTarget }) {
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

function WorkspaceServerListItemStatus({
  server,
  onClickAuthorize,
}: {
  server: WorkspaceTarget;
  onClickAuthorize?: (server: WorkspaceTarget) => void;
}) {
  switch (server.connectionInfo?.status) {
    case "connected":
      return (
        <Badge variant="success">
          <BadgeIcon>
            <CheckCircleIcon />
          </BadgeIcon>
          <BadgeLabel uppercase>
            {server.connectionInfo?.status || "--"}
          </BadgeLabel>
        </Badge>
      );
    case "unauthorized":
      return (
        <Badge
          variant="destructive"
          className={
            onClickAuthorize
              ? "cursor-pointer outline-none transition-colors hover:bg-destructive/50 focus-visible:bg-destructive/90"
              : undefined
          }
          onClick={(event) => {
            event.stopPropagation();
            onClickAuthorize?.(server);
          }}
          title="Click to authorize"
        >
          <BadgeIcon>
            <WarningCircleIcon />
          </BadgeIcon>
          <BadgeLabel uppercase>
            {server.connectionInfo?.status || "--"}
          </BadgeLabel>
        </Badge>
      );
    default:
      return (
        <Badge>
          <BadgeLabel uppercase>
            {server.connectionInfo?.status || "--"}
          </BadgeLabel>
        </Badge>
      );
  }
}
