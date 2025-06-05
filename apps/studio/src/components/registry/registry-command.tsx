"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import {
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

interface RegistryCommandProps {
  serverId: string;
}

export function RegistryCommand({ serverId }: RegistryCommandProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = trpc.registry.getEntries.useQuery({
    pageIndex: 0,
    pageSize: 1000,
  });

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)} disabled={isLoading}>
        Add
      </Button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <VisuallyHidden>
          <DialogTitle>Add tool</DialogTitle>
        </VisuallyHidden>
        <CommandInput placeholder="Search for a tool..." />
        <CommandList>
          <CommandEmpty>
            <EmptyStateTitle>No results found.</EmptyStateTitle>
            <EmptyStateDescription>
              Try searching for a different tool.
            </EmptyStateDescription>
          </CommandEmpty>
          <CommandGroup>
            {data?.entries.map((entry) => (
              <CommandItem
                value={entry.name}
                key={entry.id}
                onSelect={() => {
                  router.push(
                    `/library/mcp/${entry.name}?serverId=${serverId}`,
                  );
                  setIsOpen(false);
                }}
              >
                <div className="flex min-w-0 flex-col gap-y-1 overflow-hidden">
                  <span>{entry.title}</span>
                  <span className="truncate text-fg-subtle text-xs">
                    {entry.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
