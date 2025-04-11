import { Container } from "@/components/container";
import { ListTools } from "@/components/mcp/list-tools";
import { useCurrentServer } from "@/components/providers/connection-provider";
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

export function ProxiesGetRoute() {
  const currentServer = useCurrentServer();

  if (!currentServer) {
    return <div>Proxy not found</div>;
  }

  return (
    <Container size="md">
      <Section>
        <SectionHeader>
          <SectionTitle>{currentServer.name}</SectionTitle>
          <SectionDescription>{currentServer.description}</SectionDescription>
        </SectionHeader>

        <Accordion type="single" collapsible>
          <AccordionItem value="one-click">
            <AccordionTrigger>Install via integrations</AccordionTrigger>
            <AccordionContent>
              {currentServer.integrations.map((integration) => (
                <div key={integration}>{integration}</div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="manual">
            <AccordionTrigger>Install manually</AccordionTrigger>
            <AccordionContent>
              <p>http://localhost:3000/{currentServer.id}/sse</p>
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
            {currentServer.servers.map((server) => (
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
        <ListTools proxyId={currentServer.id} />
      </Section>
    </Container>
  );
}
