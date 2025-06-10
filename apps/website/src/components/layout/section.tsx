import { cn } from "@/lib/cn";
import { ComponentProps } from "react";

export function Section({
  className,
  children,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      data-slot="section"
      className={cn(
        "[[data-slot=separator]+&]:-mt-2 flex flex-col gap-y-6 sm:gap-y-8 md:gap-y-10",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

interface SectionHeaderProps extends ComponentProps<"header"> {
  centered?: boolean;
}

export function SectionHeader({
  className,
  children,
  centered,
  ...props
}: SectionHeaderProps) {
  return (
    <header
      data-slot="section-header"
      className={cn(
        "flex flex-col gap-y-2",
        centered && "max-w-xl sm:mx-auto sm:items-center sm:text-center",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

export function SectionTitle({
  className,
  children,
  ...props
}: ComponentProps<"h2">) {
  return (
    <h2
      data-slot="section-title"
      className={cn(
        "text-balance font-[450] text-2xl leading-tight sm:text-3xl",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function SectionDescription({
  className,
  children,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      data-slot="section-description"
      className={cn(
        "max-w-xl text-pretty text-base text-fg/80 leading-snug sm:text-lg",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function SectionActions({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-row justify-center gap-2 pt-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}
