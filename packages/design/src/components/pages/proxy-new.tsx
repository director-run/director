import { ProxyForm, ProxyFormButton } from "../proxies/proxy-form";
import type { ProxyFormData } from "../proxies/proxy-form";
import { Container } from "../ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "../ui/section";

interface ProxyNewProps {
  onSubmit: (values: ProxyFormData) => Promise<void> | void;
  isSubmitting: boolean;
}

export function ProxyNew({ onSubmit, isSubmitting }: ProxyNewProps) {
  return (
    <Container size="sm">
      <Section className="gap-y-8">
        <SectionHeader>
          <SectionTitle>New proxy</SectionTitle>
          <SectionDescription>
            Create a new proxy to start using MCP.
          </SectionDescription>
        </SectionHeader>
        <SectionSeparator />
        <ProxyForm
          onSubmit={async (values) => {
            await onSubmit(values);
          }}
        >
          <ProxyFormButton isSubmitting={isSubmitting}>
            Create proxy
          </ProxyFormButton>
        </ProxyForm>
      </Section>
    </Container>
  );
}
