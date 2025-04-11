import { useMcpClient } from "@/hooks/use-mcp-client";
import {} from "../ui/alert";

interface MCPCapabilitiesListProps {
  proxyId: string;
}

export function MCPCapabilitiesList({ proxyId }: MCPCapabilitiesListProps) {
  const { isLoading, tools, resources, prompts } = useMcpClient(proxyId);

  return (
    <div>
      {tools.map((tool) => {
        return <div key={tool.name}>{tool.name}</div>;
      })}
    </div>
  );
}
