import { cn } from "@director.run/design/lib/cn";
import { Separator } from "@director.run/design/ui/separator";
import { Slot } from "radix-ui";

interface SectionProps extends React.ComponentProps<"section"> {
  asChild?: boolean;
}

export function Section({
  children,
  className,
  asChild,
  ...props
}: SectionProps) {
  const Comp = asChild ? Slot.Root : "section";

  return (
    <Comp
      className={cn(
        "@container/section relative flex scroll-m-20 flex-col gap-y-5",
        className,
      )}
      data-slot="section"
      {...props}
    >
      {children}
    </Comp>
  );
}

export function SectionHeader({
  children,
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn("flex flex-col gap-1.5", className)}
      data-slot="section-header"
      {...props}
    >
      {children}
    </header>
  );
}

interface SectionTitleProps extends React.ComponentProps<"h1"> {
  asChild?: boolean;
}

export function SectionTitle({
  children,
  className,
  asChild,

  ...props
}: SectionTitleProps) {
  const Comp = asChild ? Slot.Root : "h1";

  return (
    <Comp
      className={cn(
        "font-[450] text-xl",
        "[&>a]:focus-visible [&>a]:hover:underline [&>a]:hover:decoration-[0.075em] [&>a]:hover:underline-offset-2",
        className,
      )}
      data-slot="section-title"
      {...props}
    >
      {children}
    </Comp>
  );
}

interface SectionDescriptionProps extends React.ComponentProps<"p"> {
  asChild?: boolean;
}

export function SectionDescription({
  children,
  className,
  asChild,

  ...props
}: SectionDescriptionProps) {
  const Comp = asChild ? Slot.Root : "p";

  return (
    <Comp
      className={cn(
        "max-w-[52ch] text-pretty text-content-secondary text-sm",
        className,
      )}
      data-slot="section-description"
      {...props}
    >
      {children}
    </Comp>
  );
}

export const SectionSeparator = (
  props: React.ComponentProps<typeof Separator>,
) => {
  return <Separator data-slot="section-separator" {...props} />;
};
