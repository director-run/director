import { NewProxyForm } from "@/components/proxies/proxy-form";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";

export default function NewProxyPage() {
  return (
    <Container className="py-12" size="sm">
      <Section>
        <SectionHeader>
          <SectionTitle>New proxy</SectionTitle>
          <SectionDescription>
            Create a new proxy to start using MCP.
          </SectionDescription>
        </SectionHeader>
        <SectionSeparator />
        <NewProxyForm />
      </Section>
    </Container>
  );
}
