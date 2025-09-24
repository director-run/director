import type { WorkspaceDetail } from "../types";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";

export interface WorkspaceSectionHeaderProps {
  workspace: WorkspaceDetail;
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
