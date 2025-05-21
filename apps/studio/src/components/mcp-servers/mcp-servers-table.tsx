import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDeterministicColor } from "@/lib/deterministic-colors";
import { ProxyAttributes } from "@director.run/gateway/db/schema";
import { ProxyTargetAttributes } from "@director.run/mcp/types";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

function McpServerRow({
  server,
  proxy,
}: { server: ProxyTargetAttributes; proxy: ProxyAttributes }) {
  return (
    <TableRow>
      <TableCell className="w-full">
        <p>{server.name}</p>
      </TableCell>
      <TableCell>
        <div className="flex min-h-6 flex-row flex-wrap items-center gap-0.5">
          <Badge variant={getDeterministicColor(server.transport.type)}>
            {server.transport.type}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="w-px p-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/proxies/${proxy.id}/servers/${server.name}`}>
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface McpServersTableProps {
  servers: ProxyTargetAttributes[];
  proxy: ProxyAttributes;
}

export function McpServersTable({ servers, proxy }: McpServersTableProps) {
  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-y-2 bg-element py-4 text-foreground-subtle">
        <p>No servers configured</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Transport</TableHead>
          <TableHead className="w-px" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {servers.map((server) => (
          <McpServerRow key={server.name} server={server} proxy={proxy} />
        ))}
      </TableBody>
    </Table>
  );
}
