"use client";

import { Tooltip } from "@director.run/design/components/tooltip";
import { useCopyToClipboard } from "@director.run/design/hooks/use-copy-to-clipboard";
import { cn } from "@director.run/design/lib/cn";
import { Button } from "@director.run/design/ui/button";
import { type VariantProps, cva } from "class-variance-authority";
import { CopyIcon } from "lucide-react";
import type { ComponentProps } from "react";

interface DetailListProps extends ComponentProps<"div"> {
  label?: string;
}

export function DetailList({
  label,
  className,
  children,
  ...props
}: DetailListProps) {
  return (
    <div
      className={cn("group/detail-list flex flex-col gap-y-1", className)}
      data-slot="detail-list"
      {...props}
    >
      {label && (
        <div className="px-2 pb-1 font-medium text-content-secondary text-xs leading-4 tracking-wide dark:text-content-tertiary">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export function DetailListItem({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/detail-list-item flex min-w-0 max-w-full items-center justify-start gap-x-1",
        className,
      )}
      data-slot="detail-list-item"
      {...props}
    >
      {children}
    </div>
  );
}

const detailListTriggerVariants = cva(
  [
    "min-w-0 shrink-1 text-start",
    "group-focus-within/detail-list-item:bg-interactive-secondary/50 group-hover/detail-list-item:bg-interactive-secondary/50",
    "[&>span]:font-[425] [&>span]:text-[13px] [&>span]:leading-5 [&>svg]:text-content-tertiary",
    "not-[button]:cursor-default not-[button]:hover:bg-transparent group-focus-within/detail-list-item:not-[button]:bg-transparent group-hover/detail-list-item:not-[button]:bg-transparent",
  ],
  {
    variants: {
      variant: {
        "single-line": "truncate [&>span]:truncate",
        "multi-line":
          "h-auto items-start text-pretty py-1 [&>span]:whitespace-normal",
        action:
          "ml-auto shrink-0 opacity-0 group-focus-within/detail-list-item:opacity-100 group-hover/detail-list-item:opacity-100 [&>svg]:text-content-primary has-[.sr-only]:[&>svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "single-line",
    },
  },
);

type DetailListTriggerVariant = VariantProps<
  typeof detailListTriggerVariants
>["variant"];

interface DetailListTriggerProps
  extends Omit<ComponentProps<typeof Button>, "variant" | "size"> {
  variant?: DetailListTriggerVariant;
}

export function DetailListTrigger({
  className,
  children,
  variant = "single-line",
  ...props
}: DetailListTriggerProps) {
  return (
    <Button
      className={cn(detailListTriggerVariants({ variant }), className)}
      data-variant={variant}
      size="sm"
      variant="tertiary"
      {...props}
    >
      {children}
    </Button>
  );
}

interface DetailListCopyActionProps
  extends Omit<
    ComponentProps<typeof DetailListTrigger>,
    "onClick" | "children"
  > {
  value: string;
}

export function DetailListCopyAction({
  value,
  ...props
}: DetailListCopyActionProps) {
  const [, copy] = useCopyToClipboard();

  return (
    <DetailListTrigger
      onClick={() => copy(value)}
      tooltip="Copy to clipboard"
      tooltipProps={{
        disableHoverableContent: true,
      }}
      variant="action"
      {...props}
    >
      <CopyIcon />
      <span className="sr-only">More</span>
    </DetailListTrigger>
  );
}

export function DetailListTriggerIcon({
  value,
  children,
  className,
  ...props
}: ComponentProps<typeof Tooltip>) {
  return (
    <Tooltip
      delayDuration={1000}
      disableHoverableContent
      value={value}
      {...props}
    >
      <span
        className={cn(
          "shrink-0 [[data-variant=multi-line]_&]:relative [[data-variant=multi-line]_&]:top-0.75",
          className,
        )}
      >
        {children}
      </span>
    </Tooltip>
  );
}
