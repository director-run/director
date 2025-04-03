"use client";

import { ZapIcon, ZapOffIcon } from "lucide-react";

import {
  type ConnectionStatus,
  useConnectionContext,
} from "@/components/connection/connection-provider";
import { Button } from "@/components/ui/button";
import { assertUnreachable } from "@/lib/assert-unreachable";

const getStatusText = (status: ConnectionStatus) => {
  switch (status) {
    case "connected":
      return "Connected to Director CLI";
    case "disconnected":
      return "Unable to connect to Director CLI";
    case "idle":
      return "Waiting for connection...";
    default:
      return assertUnreachable(status);
  }
};

export function ConnectionStatus() {
  const { status } = useConnectionContext();

  return (
    <Button variant="ghost" size="icon" tooltip={getStatusText(status)} asChild>
      <span>
        {status === "connected" ? (
          <ZapIcon fill="currentColor" />
        ) : (
          <ZapOffIcon fill="currentColor" />
        )}
      </span>
    </Button>
  );
}
