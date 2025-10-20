import { ProxyForm, WorkspaceFormButton } from "../playbooks/playbook-form";
import type { ProxyFormData } from "../playbooks/playbook-form";
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

export function WorkspaceCreate({ onSubmit, isSubmitting }: ProxyNewProps) {
  return (
    <Container size="sm">
      <Section className="gap-y-8">
        <SectionHeader>
          <SectionTitle>New workspace</SectionTitle>
          <SectionDescription>
            Create a new workspace to start using MCP.
          </SectionDescription>
        </SectionHeader>
        <SectionSeparator />
        <ProxyForm
          onSubmit={async (values) => {
            await onSubmit(values);
          }}
        >
          <WorkspaceFormButton isSubmitting={isSubmitting}>
            Create workspace
          </WorkspaceFormButton>
        </ProxyForm>
      </Section>
    </Container>
  );
}
