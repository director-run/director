"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatDistanceToNow } from "date-fns";
import {
  type ServerStatus,
  ServerStatusIndicator,
} from "./server-status-indicator";

interface ServerStatusInfo {
  status: ServerStatus;
  lastError?: string | null;
  lastErrorAt?: Date | null;
  connectedAt?: Date | null;
  lastAttemptAt?: Date | null;
  errorCategory?: string | null;
  isRetryable?: boolean | null;
  suggestedAction?: string | null;
  circuitBreakerState?: string | null;
}

interface ServerStatusDetailsProps {
  statusInfo: ServerStatusInfo;
  className?: string;
}

function formatTimestamp(date: Date | null | undefined): string {
  if (!date) {
    return "Never";
  }
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

function getStatusDescription(status: ServerStatus): string {
  switch (status) {
    case "running":
      return "Server is healthy and responding";
    case "failed":
      return "Server is not responding or encountered an error";
    case "starting":
      return "Server is starting up";
    case "disabled":
      return "Server has been manually disabled";
    case "disconnected":
      return "Server is not connected";
    default:
      return "Unknown status";
  }
}

export function ServerStatusDetails({
  statusInfo,
  className,
}: ServerStatusDetailsProps) {
  const {
    status,
    lastError,
    lastErrorAt,
    connectedAt,
    lastAttemptAt,
    errorCategory,
    isRetryable,
    suggestedAction,
    circuitBreakerState,
  } = statusInfo;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <ServerStatusIndicator status={status} size="lg" />
        <div>
          <div className="font-medium capitalize">{status}</div>
          <div className="text-fg-subtle text-sm">
            {getStatusDescription(status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="font-medium text-fg-subtle text-sm">Connected</div>
          <div className="text-sm">{formatTimestamp(connectedAt)}</div>
        </div>

        <div>
          <div className="font-medium text-fg-subtle text-sm">
            Last Connection Attempt
          </div>
          <div className="text-sm">{formatTimestamp(lastAttemptAt)}</div>
        </div>
      </div>

      {lastError && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="font-medium text-fg-subtle text-sm">Last Error</div>
            {errorCategory && (
              <Badge variant="default" className="px-2 text-xs">
                {errorCategory.charAt(0).toUpperCase() + errorCategory.slice(1)}
              </Badge>
            )}
            {isRetryable !== null && (
              <Badge
                variant={isRetryable ? "default" : "destructive"}
                className="px-2 text-xs"
              >
                {isRetryable ? "Retryable" : "Not Retryable"}
              </Badge>
            )}
          </div>

          <div className="rounded-md bg-destructive p-3 font-mono text-destructive-fg text-sm">
            {lastError}
          </div>

          <div className="text-fg-subtle text-xs">
            {formatTimestamp(lastErrorAt)}
          </div>

          {suggestedAction && (
            <div className="rounded-md bg-accent/50 p-3 text-sm">
              <div className="mb-1 font-medium text-fg-subtle">
                Suggested Action:
              </div>
              <div className="text-fg">{suggestedAction}</div>
            </div>
          )}
        </div>
      )}

      {circuitBreakerState && (
        <div>
          <div className="font-medium text-fg-subtle text-sm">
            Circuit Breaker
          </div>
          <Badge variant="default" className="text-xs">
            {circuitBreakerState}
          </Badge>
        </div>
      )}
    </div>
  );
}
