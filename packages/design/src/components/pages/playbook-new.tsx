import { PlaybookForm, PlaybookFormButton } from "../playbooks/playbook-form";
import type { PlaybookFormData } from "../playbooks/playbook-form";
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
          <SectionTitle>New playbook</SectionTitle>
          <SectionDescription>Create a new playbook.</SectionDescription>
        </SectionHeader>
        <SectionSeparator />
        <PlaybookForm
          onSubmit={async (values) => {
            await onSubmit(values);
          }}
        >
          <PlaybookFormButton isSubmitting={isSubmitting}>
            Create playbook
          </PlaybookFormButton>
        </PlaybookForm>
      </Section>
    </Container>
  );
}
