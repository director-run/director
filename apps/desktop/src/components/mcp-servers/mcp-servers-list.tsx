import {
  proxyQueryStatesSerializer,
  useProxyQueryStates,
} from "@/hooks/use-proxy-query-states";
import { assertUnreachable } from "@/lib/assert-unreachable";
import { McpServer } from "@director/backend/src/services/db/schema";
import { HardDrive, Terminal } from "@phosphor-icons/react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function ServerIcon({ transport }: { transport: McpServer["transport"] }) {
  switch (transport.type) {
    case "stdio":
      return <Terminal />;
    case "sse":
      return <HardDrive />;
    default:
      assertUnreachable(transport);
  }
}

interface MCPServersListProps {
  servers: McpServer[];
}

export function MCPServersList({ servers }: MCPServersListProps) {
  const [proxyQueryStates] = useProxyQueryStates();

  if (servers.length === 0) {
    return (
      <Alert variant="default">
        <AlertTitle>No servers found</AlertTitle>
        <AlertDescription>
          Add a server to the proxy to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {servers.map((it) => {
        return (
          <Link
            key={`${it.name}`}
            href={`/proxy${proxyQueryStatesSerializer({ ...proxyQueryStates, mcpId: it.name })}`}
            className="flex h-8 items-center gap-x-2 rounded-full bg-muted px-3"
          >
            <Tooltip>
              <TooltipTrigger className="rounded-full opacity-50 hover:opacity-100">
                <ServerIcon transport={it.transport} />
              </TooltipTrigger>
              <TooltipContent>{it.transport.type.toUpperCase()}</TooltipContent>
            </Tooltip>

            <span className="font-mono text-sm leading-6">{it.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
