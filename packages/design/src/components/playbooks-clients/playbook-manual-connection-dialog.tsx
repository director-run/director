import { CopyIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { SelectNative } from "../ui/select-native";

type TransportType = "http" | "sse" | "stdio";

interface ManualInputProps {
  id: string;
  gatewayBaseUrl: string;
  onCopy: (text: string) => void;
}

export function ManualInput({ id, gatewayBaseUrl, onCopy }: ManualInputProps) {
  const [transportType, setTransportType] = useState<TransportType>("http");

  const transports: Record<TransportType, string> = {
    http: `${gatewayBaseUrl}/${id}/mcp`,
    sse: `${gatewayBaseUrl}/${id}/sse`,
    stdio: `director http2stdio ${gatewayBaseUrl}/${id}/sse`,
  };

  return (
    <div className="relative flex pt-1">
      <div className="w-fit">
        <SelectNative
          value={transportType}
          onChange={(e) => setTransportType(e.target.value as TransportType)}
          className="h-8 rounded-r-none border-[0.5px] border-fg/20 bg-accent-subtle font-medium text-[13px] text-muted-foreground shadow-none ring-0 hover:text-foreground focus-visible:border-fg/30 focus-visible:ring-0"
        >
          <option value="http">HTTP</option>
          <option value="sse">SSE</option>
          <option value="stdio">STDIO</option>
        </SelectNative>
      </div>
      <Input
        autoFocus
        className="-mx-px h-8 rounded-none border-[0.5px] border-fg/30 pr-0 font-medium font-mono text-[13px] shadow-none focus-visible:border-fg/30 focus-visible:ring-0"
        readOnly
        value={transports[transportType]}
      />
      <div className="flex size-8 shrink-0 items-center justify-center rounded-r-md border-[0.5px] border-fg/20 bg-accent-subtle">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onCopy(transports[transportType])}
        >
          <CopyIcon />
        </Button>
      </div>
    </div>
  );
}

interface PlaybookManualDialogProps extends ComponentProps<typeof Dialog> {
  playbookId: string;
  gatewayBaseUrl: string;
  children?: ReactNode;
  onCopy: (text: string) => void;
}

export function PlaybookManualDialog({
  playbookId,
  gatewayBaseUrl,
  children,
  onCopy,
  ...props
}: PlaybookManualDialogProps) {
  return (
    <Dialog {...props}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect manually</DialogTitle>
          <DialogDescription>
            Director works with any MCP enabled product. Below you'll find
            endpoints for both Streamable HTTP and SSE, as well as STDIO via our
            CLI.
          </DialogDescription>
        </DialogHeader>

        <div className="border-t-[0.5px] p-5">
          <ManualInput
            id={playbookId}
            gatewayBaseUrl={gatewayBaseUrl}
            onCopy={onCopy}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
