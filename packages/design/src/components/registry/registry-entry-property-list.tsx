import type { ComponentProps } from "react";

import { GlobeIcon, TerminalIcon } from "@phosphor-icons/react";
import type { RegistryEntryDetail } from "../types";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "../ui/badge";
import {
  List,
  ListItem,
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "../ui/list";

interface RegistryEntryPropertyListProps extends ComponentProps<typeof List> {
  entry: RegistryEntryDetail;
}

export function RegistryEntryPropertyList({
  entry,
  ...props
}: RegistryEntryPropertyListProps) {
  return (
    <List {...props}>
      <SpecificRegistryEntryPropertyList entry={entry} />
    </List>
  );
}

function SpecificRegistryEntryPropertyList({
  entry,
}: { entry: RegistryEntryDetail }) {
  const transport = entry.transport;
  if (transport.type === "stdio") {
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
            <BadgeLabel>{transport.command}</BadgeLabel>
          </Badge>
        </ListItem>
        {transport.args.length > 0 && (
          <ListItem>
            <ListItemDetails>
              <ListItemTitle>Arguments</ListItemTitle>
            </ListItemDetails>

            <BadgeGroup className="ml-auto justify-end">
              {transport.args.map((it) => (
                <Badge key={it}>
                  <BadgeLabel>{it}</BadgeLabel>
                </Badge>
              ))}
            </BadgeGroup>
          </ListItem>
        )}
        {transport.env && Object.keys(transport.env).length > 0 && (
          <ListItem>
            <ListItemDetails>
              <ListItemTitle>Environment</ListItemTitle>
            </ListItemDetails>

            <BadgeGroup className="ml-auto justify-end">
              {Object.entries(transport.env).map(([key, value]) => (
                <Badge key={key}>
                  <BadgeLabel>{`${key}=${value}`}</BadgeLabel>
                </Badge>
              ))}
            </BadgeGroup>
          </ListItem>
        )}
      </>
    );
  } else if (transport.type === "http") {
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
      </>
    );
  } else {
    return undefined;
  }
}
