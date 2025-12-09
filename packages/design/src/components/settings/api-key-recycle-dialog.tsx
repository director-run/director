import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

type DialogStep = "confirm" | "success";

interface ApiKeyRecycleDialogProps extends ComponentProps<typeof Dialog> {
  newApiKey: string | null;
  isRecycling: boolean;
  onConfirmRecycle: () => void;
  onCopy: (text: string) => void;
}

export function ApiKeyRecycleDialog({
  newApiKey,
  isRecycling,
  onConfirmRecycle,
  onCopy,
  onOpenChange,
  ...props
}: ApiKeyRecycleDialogProps) {
  const [copied, setCopied] = useState(false);

  const step: DialogStep = newApiKey ? "success" : "confirm";

  const handleCopy = () => {
    if (newApiKey) {
      onCopy(newApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCopied(false);
    }
    onOpenChange?.(open);
  };

  return (
    <Dialog {...props} onOpenChange={handleOpenChange}>
      <DialogContent dismissible={step === "confirm"}>
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle>Recycle API Key</DialogTitle>
              <DialogDescription>
                This will invalidate your current API key and generate a new
                one. Any applications using the current key will stop working.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isRecycling}
              >
                Cancel
              </Button>
              <Button onClick={onConfirmRecycle} disabled={isRecycling}>
                {isRecycling ? "Recycling..." : "Recycle Key"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>New API Key</DialogTitle>
              <DialogDescription>
                Copy your new API key now. You won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="border-t-[0.5px] p-5">
              <div className="relative flex">
                <Input
                  autoFocus
                  className="h-8 rounded-r-none border-[0.5px] border-fg/30 pr-0 font-medium font-mono text-[13px] shadow-none focus-visible:border-fg/30 focus-visible:ring-0"
                  readOnly
                  value={newApiKey ?? ""}
                />
                <div className="flex size-8 shrink-0 items-center justify-center rounded-r-md border-[0.5px] border-fg/20 bg-accent-subtle">
                  <Button size="icon" variant="ghost" onClick={handleCopy}>
                    {copied ? (
                      <CheckIcon className="text-green-500" />
                    ) : (
                      <CopyIcon />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
