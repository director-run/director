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
  title: string;
  description: string;
  onSubmit: (values: ProxyFormData) => Promise<void> | void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function ProxyNew({
  title,
  description,
  onSubmit,
  isSubmitting,
  submitLabel,
}: ProxyNewProps) {
  return (
    <Container size="sm">
      <Section className="gap-y-8">
        <SectionHeader>
          <SectionTitle>{title}</SectionTitle>
          <SectionDescription>{description}</SectionDescription>
        </SectionHeader>
        <SectionSeparator />
        <ProxyForm
          onSubmit={async (values) => {
            await onSubmit(values);
          }}
          isSubmitting={isSubmitting}
        >
          <ProxyFormButton isSubmitting={isSubmitting}>
            {submitLabel}
          </ProxyFormButton>
        </ProxyForm>
      </Section>
    </Container>
  );
}
