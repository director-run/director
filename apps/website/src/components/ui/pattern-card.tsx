"use client";

import { Slot } from "@radix-ui/react-slot";

import { Pattern, PatternDefsProps } from "@/components/ui/pattern";
import { cn } from "@/lib/cn";
import { Conditional } from "@/lib/conditional";

interface PatternCardProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  pattern?: Omit<PatternDefsProps, "id"> & { className?: string };
}

export function PatternCard({
  asChild,
  className,
  children,
  pattern,
  ...props
}: PatternCardProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Conditional
      condition={!!pattern}
      wrap={(children) => (
        <div
          data-slot="pattern-card-wrapper"
          className="group/pattern-card-wrapper relative flex flex-col p-2 text-accent has-[a:focus-visible]:text-bg has-[a]:hover:text-primary"
        >
          {children}
          <PatternCardPattern
            {...(pattern as PatternDefsProps)}
            className={cn(
              "-z-10 inset-0 text-current transition-colors duration-200 ease-in-out",
              pattern?.className,
            )}
          />
        </div>
      )}
    >
      <Comp
        data-slot="pattern-card"
        className={cn(
          "relative flex flex-col justify-between gap-y-8 p-4",
          "bg-surface outline-none",
          "transition-colors duration-200 ease-in-out",
          "shadow-[0_3px_9px_0px_rgba(55,50,46,0.07),_0_0_0_1px_rgba(55,50,46,0.1)]",
          asChild &&
            "group grow hover:shadow-[0_3px_9px_0px_rgba(55,50,46,0.07),_0_0_0_1px_rgba(55,50,46,0.1)]",
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    </Conditional>
  );
}

export function PatternCardIcon({
  className,
  ...props
}: React.ComponentProps<typeof Slot>) {
  return (
    <div
      data-slot="pattern-card-icon"
      className={cn(
        "w-fit border-[1.5px] border-primary border-dashed bg-primary/15 p-1",
        className,
      )}
    >
      <Slot
        className="size-6 text-primary transition-colors duration-200 ease-in-out"
        {...props}
      />
    </div>
  );
}

export function PatternCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pattern-card-content"
      className={cn("flex flex-col gap-y-1.5", className)}
      {...props}
    ></div>
  );
}

export function PatternCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="pattern-card-title"
      className={cn(
        "text-balance font-[450] text-fg text-lg leading-tight transition-colors duration-200 ease-in-out",
        className,
      )}
      {...props}
    />
  );
}

export function PatternCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="pattern-card-description"
      className={cn(
        "text-pretty text-fg-subtle text-sm leading-snug transition-colors duration-200 ease-in-out",
        "group-hover:text-fg group-focus-visible:text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function PatternCardPattern({
  className,
  ...props
}: React.ComponentProps<typeof Pattern>) {
  return (
    <Pattern
      data-slot="pattern-card-pattern"
      className={cn("-z-10 pointer-events-none absolute text-fg/20", className)}
      {...props}
    />
  );
}
