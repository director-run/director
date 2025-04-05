import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTools } from "@/hooks/use-mcp-client";
import {} from "../ui/alert";
import { Skeleton } from "../ui/skeleton";

interface ListToolsProps {
  proxyId: string;
}

export function ListTools({ proxyId }: ListToolsProps) {
  const { tools, isLoading } = useTools(proxyId);

  if (isLoading && tools.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Server</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-full rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-full rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-full rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (tools.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Server</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={3}>No tools found</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Server</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((it) => {
          const mcpName = it.description?.match(/^\[([^\]]+)\]/)?.[1];

          return (
            <TableRow key={it.name}>
              <TableCell>{it.name}</TableCell>
              <TableCell>
                <p className="whitespace-normal">{it.description}</p>
              </TableCell>
              <TableCell>{mcpName}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
