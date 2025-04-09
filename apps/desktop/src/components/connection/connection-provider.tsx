"use client";

import { useEffect, useState } from "react";

import { useTimeout } from "usehooks-ts";

import { assertUnreachable } from "@/lib/assert-unreachable";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/lib/trpc/trpc";
import { Proxy } from "@director/backend/src/services/db/schema";
import { Loader2Icon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { GlobalLayout } from "../global-layout";
import { toast } from "../ui/sonner";
import { ConnectionFailedView } from "./connection-failed-view";

export type ConnectionStatus = "idle" | "connected" | "disconnected";

export interface ConnectionContext {
  status: ConnectionStatus;
  servers: Proxy[];
}

const [useContext, ContextProvider] = createCtx<ConnectionContext>();

export const useConnectionContext = useContext;

export function ConnectionProvider({
  children,
}: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");

  const { data, status, error } = trpc.store.getAll.useQuery(undefined, {
    refetchInterval: 1000,
    retry: false,
    throwOnError: false,
    enabled,
  });

  useTimeout(() => {
    setEnabled(true);
  }, 1000);

  useEffect(() => {
    if (status === "success") {
      setConnectionStatus("connected");
    }

    if (status === "error") {
      setConnectionStatus("disconnected");
    }
  }, [status, error]);

  useEffect(() => {
    switch (status) {
      case "success":
        toast({
          title: "Connection established",
          description: "You are now connected to Director",
        });
        break;
      case "error":
        if (connectionStatus === "connected") {
          toast({
            title: "Connection lost",
            description: "Please check your connection and try again",
          });
        }
        break;
      case "pending":
        break;
      default:
        assertUnreachable(status);
    }
  }, [status]);

  useEffect(() => {
    const hasServers = data?.length;
    const isConnected = connectionStatus === "connected";

    if (pathname !== "/get-started" && !hasServers && isConnected) {
      navigate("/get-started");
    }

    if (pathname === "/get-started" && hasServers && !isConnected) {
      navigate("/");
    }
  }, [connectionStatus, data, pathname]);

  return (
    <ContextProvider value={{ status: connectionStatus, servers: data ?? [] }}>
      <GlobalLayout>
        {(() => {
          switch (connectionStatus) {
            case "idle":
              return (
                <div className="grid h-screen w-full place-items-center">
                  <Loader2Icon className="animate-spin text-gray-8" />
                </div>
              );
            case "connected":
              return children;
            case "disconnected":
              return <ConnectionFailedView />;
            default:
              return assertUnreachable(connectionStatus);
          }
        })()}
      </GlobalLayout>
    </ContextProvider>
  );
}
