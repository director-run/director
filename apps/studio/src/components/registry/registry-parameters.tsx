import { EntryParameter } from "@director.run/registry/db/schema";
import { ComponentProps } from "react";

import {
  Badge,
  BadgeGroup,
  BadgeIcon,
  BadgeLabel,
} from "@/components/ui/badge";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import {
  List,
  ListItem,
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "@/components/ui/list";
import { AsteriskIcon, TextTIcon } from "@phosphor-icons/react";

interface RegistryParametersProps extends ComponentProps<typeof List> {
  parameters: EntryParameter[];
}

export function RegistryParameters({
  parameters,
  ...props
}: RegistryParametersProps) {
  if (parameters.length === 0) {
    return (
      <EmptyState>
        <EmptyStateTitle>No parameters</EmptyStateTitle>
        <EmptyStateDescription>
          This MCP server does not have any parameters.
        </EmptyStateDescription>
      </EmptyState>
    );
  }

  return (
    <List {...props}>
      {parameters
        .filter(
          (parameter, index, array) =>
            array.findIndex((p) => p.name === parameter.name) === index,
        )
        .map((parameter) => (
          <ListItem key={parameter.name}>
            <ListItemDetails>
              <ListItemTitle className="font-mono">
                {parameter.name}
              </ListItemTitle>
              {parameter.description && (
                <ListItemDescription>
                  {parameter.description}
                </ListItemDescription>
              )}
            </ListItemDetails>

            <BadgeGroup>
              {parameter.required && (
                <Badge variant="destructive">
                  <BadgeIcon>
                    <AsteriskIcon weight="bold" />
                  </BadgeIcon>
                  <BadgeLabel uppercase>Required</BadgeLabel>
                </Badge>
              )}
              {parameter.type === "string" && (
                <Badge>
                  <BadgeIcon>
                    <TextTIcon />
                  </BadgeIcon>
                  <BadgeLabel uppercase>String</BadgeLabel>
                </Badge>
              )}
            </BadgeGroup>
          </ListItem>
        ))}
    </List>
  );
}
