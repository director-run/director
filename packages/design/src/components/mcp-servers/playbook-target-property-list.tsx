import type { ComponentProps } from "react";

import { GlobeIcon, TerminalIcon } from "@phosphor-icons/react";
import { ServerStatusBadge } from "../servers/server-status-badge.tsx";
import type { PlaybookTarget } from "../types";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "../ui/badge";
import {
  List,
  ListItem,
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "../ui/list";

interface McpDescriptionListProps extends ComponentProps<typeof List> {
  target: PlaybookTarget;
}

export function PlaybookTargetPropertyList({
  target,
  ...props
}: McpDescriptionListProps) {
  return (
    <List {...props}>
      <SpecificTargetPropertyList target={target} />
    </List>
  );
}

function SpecificTargetPropertyList({ target }: { target: PlaybookTarget }) {
  if (target.type === "stdio") {
    return (
      <>
        <ListItem>
          <ListItemDetails>
            <ListItemTitle>Type</ListItemTitle>
          </ListItemDetails>
          <Badge className="ml-auto">
            <BadgeIcon>
              <TerminalIcon />
            </BadgeIcon>
            <BadgeLabel>STDIO</BadgeLabel>
          </Badge>
        </ListItem>
        <ListItem>
          <ListItemDetails>
            <ListItemTitle>Command</ListItemTitle>
          </ListItemDetails>
          <Badge className="ml-auto">
            <BadgeLabel>{target.command}</BadgeLabel>
          </Badge>
        </ListItem>
        {target.args.length > 0 && (
          <ListItem>
            <ListItemDetails>
              <ListItemTitle>Arguments</ListItemTitle>
            </ListItemDetails>

            <BadgeGroup className="ml-auto justify-end">
              {target.args.map((it) => (
                <Badge key={it}>
                  <BadgeLabel>{it}</BadgeLabel>
                </Badge>
              ))}
            </BadgeGroup>
          </ListItem>
        )}
        {target.env && Object.keys(target.env).length > 0 && (
          <ListItem>
            <ListItemDetails>
              <ListItemTitle>Environment</ListItemTitle>
            </ListItemDetails>

            <BadgeGroup className="ml-auto justify-end">
              {Object.entries(target.env).map(([key, value]) => (
                <Badge key={key}>
                  <BadgeLabel>{`${key}=${value}`}</BadgeLabel>
                </Badge>
              ))}
            </BadgeGroup>
          </ListItem>
        )}
        <ListItem>
          <ListItemDetails>
            <ListItemTitle>Status</ListItemTitle>
          </ListItemDetails>

          <BadgeGroup className="ml-auto justify-end">
            <ServerStatusBadge server={target} />
          </BadgeGroup>
        </ListItem>
      </>
    );
  } else if (target.type === "http") {
    return (
      <>
        <ListItem>
          <ListItemDetails>
            <ListItemTitle>Type</ListItemTitle>
          </ListItemDetails>
          <Badge className="ml-auto">
            <BadgeIcon>
              <GlobeIcon />
            </BadgeIcon>
            <BadgeLabel>{target.type}</BadgeLabel>
          </Badge>
        </ListItem>
        <ListItem>
          <ListItemDetails>
            <ListItemTitle>URL</ListItemTitle>
          </ListItemDetails>
          <ListItemDescription className="ml-auto">
            {target.url}
          </ListItemDescription>
        </ListItem>
        <ListItem>
          <ListItemDetails>
            <ListItemTitle>Status</ListItemTitle>
          </ListItemDetails>

          <BadgeGroup className="ml-auto justify-end">
            <ServerStatusBadge server={target} />
          </BadgeGroup>
        </ListItem>
      </>
    );
  } else {
    return undefined;
  }
}
