"use client";

import { cn } from "@director.run/design/lib/cn";
import { Button } from "@director.run/design/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
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

  if (pagination.totalPages === 1) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center gap-2", {
        "justify-between": pagination.hasPreviousPage && pagination.hasNextPage,
        "justify-end": !pagination.hasPreviousPage && pagination.hasNextPage,
        "justify-start": pagination.hasPreviousPage && !pagination.hasNextPage,
      })}
    >
      {pagination.hasPreviousPage && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPageIndex(pageIndex - 1)}
        >
          <ArrowLeftIcon /> Previous
        </Button>
      )}

      {pagination.hasNextPage && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPageIndex(pageIndex + 1)}
        >
          Next <ArrowRightIcon />
        </Button>
      )}
    </div>
  );
}
