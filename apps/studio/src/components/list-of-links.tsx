"use client";
import Link from "next/link";

import { Badge, BadgeLabel } from "@/app/design/components/badge";
import { ScrambleText } from "@/app/design/components/scramble-text";
import { Container } from "@/components/ui/container";
import { ReactNode } from "react";
import { EmptyState, EmptyStateTitle } from "./ui/empty-state";

function ListSkeletonItem() {
  return (
    <Container
      size="lg"
      className="border-accent border-b-[0.5px] py-3 opacity-50 outline-none last:border-b-0"
    >
      <div className="flex flex-row gap-x-2">
        <div className="flex grow flex-col gap-y-0.5 py-0.5">
          <span className="font-medium text-[14px] leading-5 tracking-[0.01em]">
            <ScrambleText text="Loading title" />
          </span>
          <span className="text-[13px] text-fg-subtle leading-5 tracking-[0.01em]">
            <ScrambleText text="Loading subtitle" />
          </span>
        </div>

        <div className="flex flex-row gap-1">
          <Badge>
            <BadgeLabel>
              <ScrambleText text="Loading badge" />
            </BadgeLabel>
          </Badge>
        </div>
      </div>
    </Container>
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
    <Container
      size="lg"
      className="border-accent border-b-[0.5px] py-3 outline-none last:border-b-0 hover:bg-accent-subtle/50 focus-visible:bg-accent-subtle/50"
      asChild
    >
      <Link href={link.href} scroll={link.scroll}>
        <div className="flex flex-row gap-x-8">
          <div className="flex max-w-[56ch] grow flex-col gap-y-0.5 py-0.5">
            <span className="font-medium text-[14px] leading-5 tracking-[0.01em]">
              {link.title}
            </span>
            {link.subtitle && (
              <span className="line-clamp-2 text-[13px] text-fg-subtle leading-5 tracking-[0.01em]">
                {link.subtitle}
              </span>
            )}
          </div>

          <div className="ml-auto flex flex-row gap-1">{link.badges}</div>
        </div>
      </Link>
    </Container>
  );
}

interface ListOfLinksProps {
  links: LinkItem[];
  isLoading: boolean;
}

export function ListOfLinks({ links, isLoading }: ListOfLinksProps) {
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
      <Container size="lg">
        <EmptyState>
          <EmptyStateTitle>No items</EmptyStateTitle>
        </EmptyState>
      </Container>
    );
  }

  return (
    <div className="flex flex-col border-accent border-y-[0.5px]">
      {links.map((it) => (
        <ListItem key={`li-${it.title}`} link={it} />
      ))}
    </div>
  );
}
