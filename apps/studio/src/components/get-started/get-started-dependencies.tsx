"use client";

import { cn } from "@/lib/cn";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { useConnectionStatus } from "../connect/connection-status-provider";

const dependencyContent = {
  npx: {
    description: `npx is a tool that allows you to execute any Node.js package binary.`,
    install: `npm install -g npx`,
  },
  uvx: {
    description: `uvx is a tool that allows you to execute any Python package binary.`,
    install: `curl -LsSf https://astral.sh/uv/install.sh | sh`,
  },
};

export function GetStartedDependencies() {
  const { dependencies } = useConnectionStatus();

  return (
    <div className="flex flex-col gap-y-4">
      {dependencies.map((dependency) => (
        <div key={dependency.name} className="flex items-start gap-x-2.5">
          <div
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full [&>svg]:size-3",
              dependency.installed ? "bg-success" : "bg-destructive",
            )}
          >
            {dependency.installed ? (
              <CheckIcon weight="bold" />
            ) : (
              <XIcon weight="bold" />
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <div className="font-medium font-mono text-sm leading-5">
              {dependency.name}
            </div>
            <div className="text-pretty text-fg-subtle text-xs">
              {
                dependencyContent[
                  dependency.name as keyof typeof dependencyContent
                ].description
              }
            </div>

            {!dependency.installed && (
              <pre className="mt-2 self-start rounded-md border-[0.5px] border-fg/10 bg-fg/10 px-2.5 py-1 text-left font-mono text-sm selection:bg-fg selection:text-bg">
                <code>
                  {
                    dependencyContent[
                      dependency.name as keyof typeof dependencyContent
                    ].install
                  }
                </code>
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
