"use client";

import { cn } from "@/lib/cn";

export type ServerStatus =
  | "running"
  | "failed"
  | "starting"
  | "disabled"
  | "disconnected";

interface ServerStatusIndicatorProps {
  status: ServerStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusColors = {
  running: "bg-status-running",
  failed: "bg-status-failed",
  starting: "bg-status-starting",
  disabled: "bg-status-disabled",
  disconnected: "bg-status-disconnected",
} as const;

const statusSizes = {
  sm: "size-2",
  md: "size-3",
  lg: "size-4",
} as const;

export function ServerStatusIndicator({
  status,
  className,
  size = "md",
}: ServerStatusIndicatorProps) {
  const shouldAnimate = status === "starting" || status === "failed";

  return (
    <div
      className={cn(
        "rounded-full",
        statusColors[status],
        statusSizes[size],
        shouldAnimate && "animate-status-pulse",
        className,
      )}
      title={`Server status: ${status}`}
    />
  );
}
