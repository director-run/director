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
import { useProxyQuery } from "@/hooks/use-proxy-query";
import { trpc } from "@/trpc/client";

interface RegistryDialogProps {}

export function RegistryDialog() {
  const { setProxyQuery } = useProxyQuery();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = trpc.registry.getEntries.useQuery({
    pageIndex: 0,
    pageSize: 1000,
  });

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={isLoading}>
        Add
      </Button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <VisuallyHidden>
          <DialogTitle>Add tool</DialogTitle>
        </VisuallyHidden>
        <CommandInput placeholder="Search for a tool..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {data?.entries.map((entry) => (
              <CommandItem
                value={entry.name}
                key={entry.id}
                onSelect={() => {
                  setProxyQuery({ registryId: entry.name });
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
