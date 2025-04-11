"use client";

import { CircleNotch } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useTimeout } from "usehooks-ts";

import { assertUnreachable } from "@/lib/assert-unreachable";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/lib/trpc/trpc";
import { Proxy } from "@director/backend/src/services/db/schema";

export type ConnectionStatus = "idle" | "connected" | "disconnected";

export interface ConnectionContext {
  status: ConnectionStatus;
  serverIds: string[];
  serversById: Record<string, Proxy>;
  servers: Proxy[];
}

const [useContext, ContextProvider] = createCtx<ConnectionContext>();

export function ConnectionProvider({
  children,
}: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [servers, setServers] = useState<Proxy[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");

  const { data, status, error } = trpc.store.getAll.useQuery(undefined, {
    refetchInterval: 1000,
    retry: false,
    refetchOnWindowFocus: true,
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
        toast("Connection established", {
          description: "You are now connected to Director",
        });
        break;
      case "error":
        if (connectionStatus === "connected") {
          toast.error("Connection lost", {
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
    if (data) {
      setServers(data);
    }
  }, [data]);

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

  const serverIds = useMemo(() => servers.map((it) => it.id), [servers]);

  const serversById = useMemo(
    () =>
      servers.reduce(
        (acc, it) => {
          acc[it.id] = it;
          return acc;
        },
        {} as Record<string, Proxy>,
      ),
    [servers],
  );

  return (
    <ContextProvider
      value={{ status: connectionStatus, servers, serverIds, serversById }}
    >
      {(() => {
        switch (connectionStatus) {
          case "idle":
          case "disconnected":
            return (
              <div className="grid h-screen w-full place-items-center">
                <CircleNotch className="size-10 animate-spin text-foreground/50" />
              </div>
            );
          case "connected":
            return children;
          default:
            return assertUnreachable(connectionStatus);
        }
      })()}
    </ContextProvider>
  );
}

export const useConnectionContext = useContext;

export const useCurrentServer = () => {
  const { serversById, serverIds } = useConnectionContext();
  const { proxyId } = useParams<{ proxyId: string }>();

  if (!proxyId || !serverIds.includes(proxyId)) {
    return null;
  }

  return serversById[proxyId] ?? null;
};
