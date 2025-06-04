"use client";

import { CopyIcon } from "@phosphor-icons/react";

import { useCopyToClipboard } from "@/hooks/use-copy";
import { cn } from "@/lib/cn";
import { toast } from "./ui/toaster";

interface CopyCommandProps {
  command: string;
}

export function CopyCommand({ command }: CopyCommandProps) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <pre className="relative flex h-10 items-center rounded border-[0.5px] bg-accent/50 px-4 font-mono text-sm">
      <code>
        <span className="text-fg-subtle/70">$</span> {command}
      </code>

      <button
        type="button"
        className={cn(
          "absolute inset-y-1 right-1 flex size-8 items-center justify-center rounded bg-transparent text-fg-subtle",
          "cursor-pointer transition-colors duration-200 ease-in-out hover:bg-fg/15 hover:text-fg",
        )}
        onClick={() => {
          copy(command);
          toast({
            title: "Command copied to clipboard",
            description: command,
          });
        }}
      >
        <div className="sr-only">Copy to clipboard</div>
        <CopyIcon weight="fill" className="size-5 shrink-0" />
      </button>
    </pre>
  );
}
