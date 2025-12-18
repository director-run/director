import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "../../helpers/cn";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";
import { Button } from "../ui/button";
import { Section, SectionHeader, SectionTitle } from "../ui/section";
import { SelectNative } from "../ui/select-native";

type ConnectionMethod = "automatic" | "http" | "stdio";

export interface ConnectionInfo {
  playbookId: string;
  apiKey: string;
  streamableUrl: string;
}

export interface PlaybookSectionConnectProps {
  connectionInfo: ConnectionInfo | undefined;
  isLoading?: boolean;
}

function obfuscateKey(key: string): string {
  if (key.length <= 8) {
    return "••••••••";
  }
  return `${key.slice(0, 4)}${"•".repeat(8)}${key.slice(-4)}`;
}

export function PlaybookSectionConnect({
  connectionInfo,
  isLoading,
}: PlaybookSectionConnectProps) {
  const [, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);
  const [method, setMethod] = useState<ConnectionMethod>("automatic");

  const handleCopy = () => {
    const command = getFullCommand();
    if (command) {
      copy(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Full command with real API key (for clipboard)
  const getFullCommand = (): string => {
    if (!connectionInfo) {
      return "";
    }

    const urlWithKey = `${connectionInfo.streamableUrl}?key=${connectionInfo.apiKey}`;

    switch (method) {
      case "automatic":
        return `npx @director.run/cli@latest connect ${connectionInfo.playbookId}`;
      case "http":
        return urlWithKey;
      case "stdio":
        return `npx -y @director.run/cli@latest http2stdio ${urlWithKey}`;
    }
  };

  // Display command with obfuscated key (can be multiline for display)
  const getDisplayCommand = (): ReactNode => {
    if (!connectionInfo) {
      return "";
    }

    const obfuscatedKey = obfuscateKey(connectionInfo.apiKey);
    const urlWithObfuscatedKey = `${connectionInfo.streamableUrl}?key=${obfuscatedKey}`;

    switch (method) {
      case "automatic":
        return (
          <>npx @director.run/cli@latest connect {connectionInfo.playbookId}</>
        );
      case "http":
        return urlWithObfuscatedKey;
      case "stdio":
        // Format with line breaks and alignment for readability
        // "npx " is 4 chars, so indent continuation lines by 4 spaces
        return (
          <>
            npx -y @director.run/cli@latest \<br />
            {"    "}http2stdio \<br />
            {"    "}
            {urlWithObfuscatedKey}
          </>
        );
    }
  };

  const displayCommand = getDisplayCommand();

  return (
    <Section>
      <SectionHeader>
        <SectionTitle variant="h3" asChild>
          <h3>Connect to Playbook</h3>
        </SectionTitle>
      </SectionHeader>

      <div className="flex w-full flex-col gap-y-0 overflow-hidden rounded-xl bg-accent-subtle shadow-[0_0_0_0.5px_rgba(55,50,46,0.15)]">
        <div className="flex flex-col gap-y-4 p-4">
          <SelectNative
            className="w-full"
            value={method}
            onChange={(e) => setMethod(e.target.value as ConnectionMethod)}
            disabled={isLoading}
          >
            <option value="automatic">Automatically</option>
            <option value="http">Via HTTP</option>
            <option value="stdio">Via Stdio</option>
          </SelectNative>
        </div>
        <div className="flex items-center justify-between border-fg/7 border-t-[0.5px] bg-accent px-4 py-2.5">
          <div
            className={cn(
              "flex w-full resize-none flex-col rounded-md bg-surface text-sm",
              "-mx-px border-[0.5px] border-fg/30 pr-0 font-medium font-mono text-[12px]",
            )}
          >
            <div className="flex-1 whitespace-pre-wrap break-all px-3 pt-2 pb-0">
              {isLoading ? "Loading..." : displayCommand || ""}
            </div>
            <div className="flex flex-1 justify-end px-2 pt-2 pb-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={handleCopy}
                disabled={isLoading || !displayCommand}
              >
                {copied ? (
                  <CheckIcon className="text-green-500" />
                ) : (
                  <CopyIcon />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
