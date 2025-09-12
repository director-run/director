import { SealCheckIcon } from "@phosphor-icons/react";

import type { ComponentProps } from "react";
import { cn } from "../../helpers/cn";
import { McpLogo } from "../mcp-logo";

interface MCPLinkCardProps {
  className?: string;
  entry: {
    title: string;
    description?: string | null;
    icon?: string | null;
    isOfficial?: boolean | null;
  };
  onClick?: () => void;
}

export function MCPLinkCard({ className, entry, onClick }: MCPLinkCardProps) {
  return (
    <div
      className={cn(
        "flex h-40 cursor-pointer flex-col justify-between gap-y-6 rounded-lg bg-accent-subtle p-4 transition-colors duration-200 ease-in-out hover:bg-accent",
        className,
      )}
      onClick={onClick}
    >
      <McpLogo src={entry.icon} className="size-8" />

      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-1 font-[450] text-[17px]">
          {entry.title} {entry.isOfficial && <SealCheckIcon weight="fill" />}
        </div>

        {entry.description && (
          <div className="line-clamp-2 text-pretty text-[14px] text-fg-subtle">
            {entry.description}
          </div>
        )}
      </div>
    </div>
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
