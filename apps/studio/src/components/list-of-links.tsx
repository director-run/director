"use client";

import Link from "next/link";
import { ReactNode } from "react";

import { Badge, BadgeGroup, BadgeLabel } from "@/components/ui/badge";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import * as List from "@/components/ui/list";
import { ScrambleText } from "@/components/ui/scramble-text";
import { SimpleMarkdown } from "./ui/markdown";

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
}

function ListItem({ link }: { link: LinkItem }) {
  return (
    <List.ListItem asChild>
      <Link href={link.href} scroll={link.scroll}>
        <List.ListItemDetails>
          <List.ListItemTitle>{link.title}</List.ListItemTitle>
          {link.subtitle && (
            <List.ListItemDescription>
              <SimpleMarkdown>{link.subtitle}</SimpleMarkdown>
            </List.ListItemDescription>
          )}
        </List.ListItemDetails>

        {link.badges && (
          <BadgeGroup className="ml-auto">{link.badges}</BadgeGroup>
        )}
      </Link>
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
