"use client";

import { Input } from "@director.run/design/ui/input";
import { Loader2, SearchIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useTransition } from "react";

export function MCPSearchInput() {
  const [isLoading, startTransition] = useTransition();
  const [query, setQuery] = useQueryState(
    "query",
    parseAsString
      .withDefault("")
      .withOptions({ startTransition, shallow: false }),
  );

  return (
    <div>
      <Input
        value={query ?? ""}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        className="pl-9"
      >
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4" />
        {isLoading && (
          <Loader2 className="-translate-y-1/2 absolute top-1/2 right-3 size-4 animate-spin" />
        )}
      </Input>
    </div>
  );
}
