import { CopyIcon } from "@phosphor-icons/react";
import { ComponentProps, ReactNode, useState } from "react";

import { DIRECTOR_URL } from "../../config";
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
  onCopy: (text: string) => void;
}

function ManualInput({ id, onCopy }: ManualInputProps) {
  const [transportType, setTransportType] = useState<TransportType>("http");

  const transports: Record<TransportType, string> = {
    http: `${DIRECTOR_URL}/${id}/mcp`,
    sse: `${DIRECTOR_URL}/${id}/sse`,
    stdio: `director http2stdio ${DIRECTOR_URL}/${id}/sse`,
  };

  return (
    <div className="relative flex">
      <div className="w-fit">
        <SelectNative
          value={transportType}
          onChange={(e) => setTransportType(e.target.value as TransportType)}
          className="h-10 rounded-r-none border-[0.5px] border-fg/20 bg-accent-subtle font-medium text-[13px] text-muted-foreground shadow-none ring-0 hover:text-foreground focus-visible:border-fg/30 focus-visible:ring-0"
        >
          <option value="http">HTTP</option>
          <option value="sse">SSE</option>
          <option value="stdio">STDIO</option>
        </SelectNative>
      </div>
      <Input
        autoFocus
        className="-mx-px h-10 rounded-none border-[0.5px] border-fg/30 pr-0 font-medium font-mono text-[13px] shadow-none focus-visible:border-fg/30 focus-visible:ring-0"
        readOnly
        value={transports[transportType]}
      />
      <div className="flex size-10 shrink-0 items-center justify-center rounded-r-md border-[0.5px] border-fg/20 bg-accent-subtle">
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

interface ProxyManualDialogProps extends ComponentProps<typeof Dialog> {
  proxyId: string;
  children?: ReactNode;
  onCopy: (text: string) => void;
}

export function ProxyManualDialog({
  proxyId,
  children,
  onCopy,
  ...props
}: ProxyManualDialogProps) {
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
          <ManualInput id={proxyId} onCopy={onCopy} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
