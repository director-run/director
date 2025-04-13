import { useMcpClient } from "@/hooks/use-mcp-client";
import { assertUnreachable } from "@/lib/assert-unreachable";
import { CursorText, Files, Nut } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function CapabilityIcon({ type }: { type: "tool" | "prompt" | "resource" }) {
  switch (type) {
    case "tool":
      return <Nut weight="fill" />;
    case "prompt":
      return <CursorText />;
    case "resource":
      return <Files />;
    default:
      assertUnreachable(type);
  }
}

interface MCPCapabilitiesListProps {
  proxyId: string;
}

export function MCPCapabilitiesList({ proxyId }: MCPCapabilitiesListProps) {
  const { capabilities } = useMcpClient(proxyId);

  if (capabilities.length === 0) {
    return (
      <Alert variant="default">
        <AlertTitle>No capabilities found</AlertTitle>
        <AlertDescription>
          Add a server to the proxy to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {capabilities.map((capability) => {
        return (
          <span
            className="flex h-8 items-center gap-x-2 rounded-full bg-muted px-3"
            key={`${capability.type}-${capability.name}`}
          >
            <Tooltip>
              <TooltipTrigger className="rounded-full opacity-50 hover:opacity-100">
                <CapabilityIcon
                  type={capability.type as "tool" | "prompt" | "resource"}
                />
              </TooltipTrigger>
              <TooltipContent>{capability.type.toUpperCase()}</TooltipContent>
            </Tooltip>

            <span className="font-mono text-sm leading-6">
              {capability.name}
            </span>
          </span>
        );
      })}
    </div>
  );
}
