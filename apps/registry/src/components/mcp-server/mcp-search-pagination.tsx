"use client";

import { Button } from "@director.run/design/ui/button";
import {} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { EntriesOutputs } from "trpc/routers/entries-router";

interface MCPSearchPaginationProps {
  pagination: EntriesOutputs["getEntries"]["pagination"];
}

export function MCPSearchPagination({ pagination }: MCPSearchPaginationProps) {
  const [pageIndex, setPageIndex] = useQueryState(
    "pageIndex",
    parseAsInteger.withDefault(0).withOptions({ shallow: false }),
  );

  return (
    <div>
      {pagination.hasPreviousPage && (
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => setPageIndex(pageIndex - 1)}
        >
          Previous page
        </Button>
      )}
      {pagination.hasNextPage && (
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => setPageIndex(pageIndex + 1)}
        >
          Next page
        </Button>
      )}
    </div>
  );
}
