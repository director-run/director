"use client";

import { Input } from "@director.run/design/ui/input";
import { parseAsString, useQueryState } from "nuqs";

export function MCPServerList() {
  const [query, setQuery] = useQueryState(
    "query",
    parseAsString.withDefault("").withOptions({ shallow: false }),
  );

  return (
    <div>
      <Input
        value={query ?? ""}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
      />
    </div>
  );
}
