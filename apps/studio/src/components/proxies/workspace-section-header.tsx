import type { MasterWorkspace } from "../types";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";

export interface WorkspaceSectionHeaderProps {
  workspace: MasterWorkspace;
}

export function WorkspaceSectionHeader({
  workspace,
}: WorkspaceSectionHeaderProps) {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>{workspace.name}</SectionTitle>
        <SectionDescription>{workspace.description}</SectionDescription>
      </SectionHeader>
    </Section>
  );
}
