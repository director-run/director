import { cn } from "@/lib/cn";
import { Slot } from "@radix-ui/react-slot";
import { ComponentProps } from "react";

interface ListProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export function List({ asChild, className, ...props }: ListProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn("flex flex-col border-accent border-y-[0.5px]", className)}
      {...props}
    />
  );
}

interface ListItemProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export function ListItem({ asChild, className, ...props }: ListItemProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "flex flex-row items-start gap-x-8 border-accent border-b-[0.5px] py-3 outline-none last:border-b-0",
        "[a&]:hover:bg-accent-subtle/50 [a&]:focus-visible:bg-accent-subtle/50",
        className,
      )}
      {...props}
    />
  );
}

export function ListItemDetails({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex grow flex-col gap-y-0.5 py-0.5 *:max-w-[56ch]",
        className,
      )}
      {...props}
    />
  );
}

export function ListItemTitle({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "font-medium text-[14px] leading-5 tracking-[0.01em]",
        className,
      )}
      {...props}
    />
  );
}

export function ListItemDescription({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "line-clamp-1 text-[13px] text-fg-subtle leading-5 tracking-[0.01em]",
        className,
      )}
      {...props}
    />
  );
}
