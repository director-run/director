"use client";

import { ReactNode } from "react";

import { Badge, BadgeGroup, BadgeLabel } from "./ui/badge";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "./ui/empty-state";
import * as List from "./ui/list";
import { ScrambleText } from "./ui/scramble-text";

function ListSkeletonItem() {
  return (
    <List.ListItem>
      <List.ListItemDetails>
        <List.ListItemTitle>
          <ScrambleText text="Loading title" />
        </List.ListItemTitle>
        <List.ListItemDescription>
          <ScrambleText text="Loading subtitle" />
        </List.ListItemDescription>
      </List.ListItemDetails>

      <BadgeGroup>
        <Badge>
          <BadgeLabel>
            <ScrambleText text="Loading badge" />
          </BadgeLabel>
        </Badge>
      </BadgeGroup>
    </List.ListItem>
  );
}

interface LinkItem {
  href: string;
  scroll?: boolean;
  subtitle?: string;
  title: string;
  badges?: ReactNode;
  onClick?: () => void;
}

function ListItem({ link }: { link: LinkItem }) {
  return (
    <List.ListItem
      onClick={link.onClick}
      className={
        link.onClick
          ? "cursor-pointer hover:bg-accent-subtle/50 focus-visible:bg-accent-subtle/50"
          : undefined
      }
    >
      <List.ListItemDetails>
        <List.ListItemTitle>{link.title}</List.ListItemTitle>
        {link.subtitle && (
          <List.ListItemDescription>{link.subtitle}</List.ListItemDescription>
        )}
      </List.ListItemDetails>

      {link.badges && (
        <BadgeGroup className="ml-auto">{link.badges}</BadgeGroup>
      )}
    </List.ListItem>
  );
}

interface ListOfLinksProps {
  links: LinkItem[];
  isLoading: boolean;
  className?: string;
}

export function ListOfLinks({ links, isLoading, className }: ListOfLinksProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col border-accent border-y-[0.5px] opacity-50">
        {new Array(3).fill(0).map((_, index) => (
          <ListSkeletonItem key={`loading-${index}`} />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <EmptyState>
        <EmptyStateTitle>No items</EmptyStateTitle>
        <EmptyStateDescription>This list is empty.</EmptyStateDescription>
      </EmptyState>
    );
  }

  return (
    <List.List className={className}>
      {links.map((it) => (
        <ListItem key={`li-${it.title}`} link={it} />
      ))}
    </List.List>
  );
}
