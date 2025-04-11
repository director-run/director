import { McpServer } from "@director/backend/src/services/db/schema";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface MCPServersListProps {
  servers: McpServer[];
}

export function MCPServersList({ servers }: MCPServersListProps) {
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
    <div>
      {servers.map((it) => {
        return (
          <div key={it.name}>
            <div>{it.name}</div>
          </div>
        );
      })}
    </div>
  );
}
