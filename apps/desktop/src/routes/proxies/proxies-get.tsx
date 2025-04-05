import { Container } from "@/components/container";
import { ListTools } from "@/components/mcp/list-tools";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc/trpc";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router";

export function ProxiesGetRoute() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = trpc.store.get.useQuery(
    // TODO: This should use an ID not a name
    { name: id as string },
    {
      enabled: !!id,
    },
  );

  if (!data) {
    if (isLoading) {
      return (
        <div className="flex grow flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      );
    }

    if (!isLoading) {
      return (
        <div className="flex grow flex-col items-center justify-center py-16">
          <div>Proxy not found</div>
        </div>
      );
    }
  }

  return (
    <Container size="md">
      <Section>
        <SectionHeader>
          <SectionTitle>{data?.name}</SectionTitle>
          <SectionDescription>{data?.description}</SectionDescription>
        </SectionHeader>

        <Accordion type="single" collapsible>
          <AccordionItem value="one-click">
            <AccordionTrigger>Install via integrations</AccordionTrigger>
            <AccordionContent>
              {data?.integrations.map((integration) => (
                <div key={integration}>{integration}</div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="manual">
            <AccordionTrigger>Install manually</AccordionTrigger>
            <AccordionContent>
              <p>http://localhost:3000/{data?.id}/sse</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2">MCP Servers</SectionTitle>
        </SectionHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Transport</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.servers.map((server) => (
              <TableRow key={server.name}>
                <TableCell>{server.name}</TableCell>
                <TableCell>{server.transport.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2">Available tools</SectionTitle>
        </SectionHeader>
        <ListTools proxyId={id as string} />
      </Section>
    </Container>
  );
}
