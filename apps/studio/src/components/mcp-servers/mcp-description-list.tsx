import { ComponentProps } from "react";

import { GlobeIcon, TerminalIcon } from "@phosphor-icons/react";
import { StoreServerTransport } from "../types";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "../ui/badge";
import {
  List,
  ListItem,
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "../ui/list";

interface McpDescriptionListProps extends ComponentProps<typeof List> {
  transport: StoreServerTransport;
}

export function McpDescriptionList({
  transport,
  ...props
}: McpDescriptionListProps) {
  switch (transport.type) {
    case "http":
      return <McpSseDescriptionList transport={transport} {...props} />;
    case "stdio":
      return <McpStdioDescriptionList transport={transport} {...props} />;
    case "mem":
      return <div>In Memory Special Case</div>;
    default:
      assertUnreachable(transport);
  }
}

interface McpStdioDescriptionListProps extends ComponentProps<typeof List> {
  transport: StoreServerTransport;
}

function McpStdioDescriptionList({
  transport,
  ...props
}: McpStdioDescriptionListProps) {
  if (transport.type !== "stdio") {
    return null;
  }

  const args = transport.args ?? [];
  const env = transport.env ?? [];

  return (
    <List {...props}>
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
          <BadgeLabel>{transport.command}</BadgeLabel>
        </Badge>
      </ListItem>
      {args.length > 0 && (
        <ListItem>
          <ListItemDetails>
            <ListItemTitle>Arguments</ListItemTitle>
          </ListItemDetails>

          <BadgeGroup className="ml-auto justify-end">
            {args.map((it) => (
              <Badge key={it}>
                <BadgeLabel>{it}</BadgeLabel>
              </Badge>
            ))}
          </BadgeGroup>
        </ListItem>
      )}
      {Object.keys(env).length > 0 && (
        <ListItem>
          <ListItemDetails>
            <ListItemTitle>Environment</ListItemTitle>
          </ListItemDetails>

          <BadgeGroup className="ml-auto justify-end">
            {Object.entries(env).map(([key, value]) => (
              <Badge key={key}>
                <BadgeLabel>{`${key}=${value}`}</BadgeLabel>
              </Badge>
            ))}
          </BadgeGroup>
        </ListItem>
      )}
    </List>
  );
}

interface McpSseDescriptionListProps extends ComponentProps<typeof List> {
  transport: StoreServerTransport;
}

function McpSseDescriptionList({
  transport,
  ...props
}: McpSseDescriptionListProps) {
  if (transport.type !== "http") {
    return null;
  }

  return (
    <List {...props}>
      <ListItem>
        <ListItemDetails>
          <ListItemTitle>Type</ListItemTitle>
        </ListItemDetails>
        <Badge className="ml-auto">
          <BadgeIcon>
            <GlobeIcon />
          </BadgeIcon>
          <BadgeLabel>{transport.type}</BadgeLabel>
        </Badge>
      </ListItem>
      <ListItem>
        <ListItemDetails>
          <ListItemTitle>URL</ListItemTitle>
        </ListItemDetails>
        <ListItemDescription className="ml-auto">
          {transport.url}
        </ListItemDescription>
      </ListItem>
    </List>
  );
}

/**
 * @link https://stackoverflow.com/a/39419171
 */
function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here");
}
