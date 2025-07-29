"use client";

import { SealCheckIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { LinkProps } from "next/link";

import { McpLogo } from "@/components/mcp-logo";
import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";
import { ComponentProps } from "react";

interface MCPLinkCardProps extends LinkProps {
  className?: string;
  entry: {
    title: string;
    description?: string | null;
    icon?: string | null;
    isOfficial?: boolean | null;
  };
}

export function MCPLinkCard({ className, entry, ...props }: MCPLinkCardProps) {
  const registryQuery = trpc.registry.getEntryByName.useQuery(
    {
      name: entry.title,
    },
    {
      throwOnError: false,
    },
  );

  const entryData = registryQuery.data ?? entry;

  return (
    <Link
      className={cn(
        "flex h-40 flex-col justify-between gap-y-6 rounded-lg bg-accent-subtle p-4 transition-colors duration-200 ease-in-out hover:bg-accent",
        className,
      )}
      {...props}
    >
      <McpLogo src={entryData.icon} className="size-8" />

      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-1 font-[450] text-[17px]">
          {entryData.title}{" "}
          {entryData.isOfficial && <SealCheckIcon weight="fill" />}
        </div>

        {entryData.description && (
          <div className="line-clamp-2 text-pretty text-[14px] text-fg-subtle">
            {entryData.description}
          </div>
        )}
      </div>
    </Link>
  );
}

export function MCPLinkCardList({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "@container grid @2xl:grid-cols-2 grid-cols-1 gap-3",
        className,
      )}
      {...props}
    />
  );
}
