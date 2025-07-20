"use client";

import {
  TooltipContent,
  Tooltip as TooltipPrimitive,
  TooltipTrigger,
} from "@director.run/design/ui/tooltip";
import type * as React from "react";

interface TooltipProps extends React.ComponentProps<typeof TooltipContent> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value: string;
  delayDuration?: number;
  disableHoverableContent?: boolean;
}

export function Tooltip({
  value,
  children,
  delayDuration = 0,
  disableHoverableContent = false,
  asChild = true,
  open,
  onOpenChange,
  ...props
}: TooltipProps) {
  return (
    <TooltipPrimitive
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
      onOpenChange={onOpenChange}
      open={open}
    >
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      <TooltipContent {...props}>{value}</TooltipContent>
    </TooltipPrimitive>
  );
}
