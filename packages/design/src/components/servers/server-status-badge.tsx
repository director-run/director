import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { PlaybookTarget } from "../types.ts";
import { Badge, BadgeIcon, BadgeLabel } from "../ui/badge.tsx";

export function ServerStatusBadge({
  server,
  onClickAuthorize,
}: {
  server: PlaybookTarget;
  onClickAuthorize?: (server: PlaybookTarget) => void;
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
