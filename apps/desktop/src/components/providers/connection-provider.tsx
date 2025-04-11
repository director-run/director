"use client";

import { CircleNotch } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTimeout } from "usehooks-ts";

import { assertUnreachable } from "@/lib/assert-unreachable";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/lib/trpc";

export type ConnectionStatus = "idle" | "connected" | "disconnected";

export interface ConnectionContext {
  status: ConnectionStatus;
}

const [useContext, ContextProvider] = createCtx<ConnectionContext>();

export function ConnectionProvider({
  children,
}: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");

  const { status: healthStatus } = trpc.health.status.useQuery(undefined, {
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
    if (healthStatus === "success") {
      setConnectionStatus("connected");
    }

    if (healthStatus === "error") {
      setConnectionStatus("disconnected");
    }
  }, [healthStatus]);

  useEffect(() => {
    switch (connectionStatus) {
      case "connected":
        toast("Connection established", {
          description: "You are now connected to Director",
        });
        break;
      case "disconnected":
        toast.error("Connection lost", {
          description: "Please check your connection and try again",
        });
        break;
      case "idle":
        break;
      default:
        assertUnreachable(connectionStatus);
    }
  }, [connectionStatus]);

  // useEffect(() => {
  //   if (data) {
  //     setServers(data);
  //   }
  // }, [data]);

  // useEffect(() => {
  //   const hasServers = data?.length;
  //   const isConnected = connectionStatus === "connected";

  //   if (pathname !== "/get-started" && !hasServers && isConnected) {
  //     router.replace("/get-started");
  //   }

  //   if (pathname === "/get-started" && hasServers && !isConnected) {
  //     router.replace("/");
  //   }
  // }, [connectionStatus, data, pathname]);

  // const serverIds = useMemo(() => servers.map((it) => it.id), [servers]);

  // const serversById = useMemo(
  //   () =>
  //     servers.reduce(
  //       (acc, it) => {
  //         acc[it.id] = it;
  //         return acc;
  //       },
  //       {} as Record<string, Proxy>,
  //     ),
  //   [servers],
  // );

  // console.log(healthData);

  return (
    <ContextProvider value={{ status: connectionStatus }}>
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

// export const useMaybeCurrentServer = () => {
//   const { serversById, serverIds, servers } = useConnectionContext();
//   const [proxyId] = useQueryState("proxyId");

//   if (!proxyId || !serverIds.includes(proxyId)) {
//     return null;
//   }

//   return serversById[proxyId] ?? null;
// };

// export const useCurrentServer = () => {
//   const currentServer = useMaybeCurrentServer();

//   if (!currentServer) {
//     throw new Error("No current server");
//   }

//   return currentServer;
// };
