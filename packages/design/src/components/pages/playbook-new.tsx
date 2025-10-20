import { PlaybookForm, WorkspaceFormButton } from "../playbooks/playbook-form";
import type { PlaybookFormData as PlaybookFormData } from "../playbooks/playbook-form";
import { Container } from "../ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "../ui/section";

interface PlaybookNewProps {
  onSubmit: (values: PlaybookFormData) => Promise<void> | void;
  isSubmitting: boolean;
}

export function PlaybookCreate({ onSubmit, isSubmitting }: PlaybookNewProps) {
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
        <PlaybookForm
          onSubmit={async (values) => {
            await onSubmit(values);
          }}
        >
          <WorkspaceFormButton isSubmitting={isSubmitting}>
            Create workspace
          </WorkspaceFormButton>
        </PlaybookForm>
      </Section>
    </Container>
  );
}
