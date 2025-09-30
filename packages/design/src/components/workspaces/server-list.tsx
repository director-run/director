import type { WorkspaceTarget } from "../types.ts";
import { Badge, BadgeGroup, BadgeLabel } from "../ui/badge.tsx";
import * as List from "../ui/list.tsx";

export function WorkspaceServerList({
  servers,
  onClickServer,
}: {
  servers: WorkspaceTarget[];
  onClickServer?: (server: WorkspaceTarget) => void;
}) {
  return (
    <List.List>
      {servers.map((server) => (
        <WorkspaceServerListItem
          server={server}
          onClick={onClickServer && (() => onClickServer(server))}
        />
      ))}
    </List.List>
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
        <List.ListItemDescription>{server.type}</List.ListItemDescription>
      </List.ListItemDetails>

      <BadgeGroup>
        <Badge>
          <BadgeLabel>Something</BadgeLabel>
        </Badge>
      </BadgeGroup>
    </List.ListItem>
  );
}
