"use client";

import { useInspectMcp } from "@/hooks/use-inspect-mcp";
import Markdown from "react-markdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface McpToolTableProps {
  proxyId: string;
  serverId?: string;
}

export function McpToolsTable({ proxyId, serverId }: McpToolTableProps) {
  const { isLoading, tools } = useInspectMcp(proxyId, serverId);

  if (isLoading) {
    // TODO: Add loading state
    return <div>Loading…</div>;
  }

  if (tools.length === 0) {
    // TODO: Add Empty
    return <div>No tools found</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Server</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((tool) => {
          const server = tool.description?.match(/\[([^\]]+)\]/)?.[1];
          return (
            <TableRow key={tool.name}>
              <TableCell>{tool.name}</TableCell>
              <TableCell>{server}</TableCell>
              <TableCell>
                <Markdown>
                  {tool.description?.replace(`[${server}] `, "")}
                </Markdown>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
