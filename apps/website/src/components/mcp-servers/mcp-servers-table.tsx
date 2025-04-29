import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDeterministicColor } from "@/lib/deterministic-colors";
import type {
  ProxyAttributes,
  ProxyTargetAttributes,
} from "@director.run/db/schema";
import { EllipsisVerticalIcon } from "lucide-react";
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="radix-state-[open]:bg-primary radix-state-[open]:text-foreground-inverse"
            >
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuLabel>Server actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/proxies/${proxy.id}/server/${server.name}`}>
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Remove server</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

interface McpServersTableProps {
  servers: ProxyTargetAttributes[];
  proxy: ProxyAttributes;
}

export function McpServersTable({ servers, proxy }: McpServersTableProps) {
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
      <TableCaption>
        Showing {servers.length}/{servers.length} server(s)
      </TableCaption>
    </Table>
  );
}
