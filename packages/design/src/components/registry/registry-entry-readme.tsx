import { EmptyState, EmptyStateTitle } from "../ui/empty-state";
import { Markdown } from "../ui/markdown";

export function RegistryEntryReadme({ readme }: { readme: string | null }) {
  if (readme) {
    return <Markdown className="!max-w-none">{readme}</Markdown>;
  } else {
    return (
      <EmptyState>
        <EmptyStateTitle>No readme found</EmptyStateTitle>
      </EmptyState>
    );
  }
}
