import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { WorkspaceTarget } from "../types.ts";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "../ui/badge.tsx";
import { Button } from "../ui/button.tsx";
import * as List from "../ui/list.tsx";
import { Section, SectionHeader, SectionTitle } from "../ui/section.tsx";

export function WorkspaceServerList({
  servers,
  onClickServer,
  onClickAddServer,
}: {
  servers: WorkspaceTarget[];
  onClickServer?: (server: WorkspaceTarget) => void;
  onClickAddServer?: () => void;
}) {
  return (
    <Section>
      <SectionHeader className="flex flex-row items-center justify-between">
        <SectionTitle variant="h2" asChild>
          <h2>Servers</h2>
        </SectionTitle>
        <Button size="sm" onClick={onClickAddServer}>
          Add MCP server
        </Button>
      </SectionHeader>
      <List.List>
        {servers.map((server) => (
          <WorkspaceServerListItem
            server={server}
            onClick={onClickServer && (() => onClickServer(server))}
          />
        ))}
      </List.List>
    </Section>
  );
}

function WorkspaceServerListItem({
  server,
  onClick,
}: { server: WorkspaceTarget; onClick?: () => void }) {
  return (
    <List.ListItem
      key={`li-${server.name}`}
      onClick={onClick}
      className={
        onClick
          ? "cursor-pointer hover:bg-accent-subtle/50 focus-visible:bg-accent-subtle/50"
          : undefined
      }
    >
      <List.ListItemDetails>
        <List.ListItemTitle>{server.name}</List.ListItemTitle>
        <WorkspaceServerListItemDescription server={server} />
      </List.ListItemDetails>
      <BadgeGroup>
        <WorkspaceServerListItemStatus server={server} />
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
}: { server: WorkspaceTarget }) {
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
        <Badge variant="destructive">
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
