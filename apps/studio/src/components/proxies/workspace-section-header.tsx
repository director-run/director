import type { Workspace } from "../types";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";

export interface WorkspaceSectionHeaderProps {
  workspace: Workspace;
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
