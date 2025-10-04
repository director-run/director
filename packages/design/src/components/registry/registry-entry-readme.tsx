import { EmptyState, EmptyStateTitle } from "../ui/empty-state";
import { Markdown } from "../ui/markdown";

export function RegistryEntryReadme({ readme }: { readme: string | null }) {
  if (readme) {
    return (
      <Markdown className="!max-w-none rounded-xl border-[0.5px] bg-accent-subtle/20 p-6">
        {readme}
      </Markdown>
    );
  } else {
    return (
      <EmptyState>
        <EmptyStateTitle>No readme found</EmptyStateTitle>
      </EmptyState>
    );
  }
}
