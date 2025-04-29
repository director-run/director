import { cn } from "@/lib/cn";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps } from "class-variance-authority";
import { Separator } from "./separator";
import { textVariants } from "./typography";

interface SectionProps extends React.ComponentProps<"section"> {
  name?: string;
  asChild?: boolean;
}

export function Section({
  children,
  className,
  asChild,
  name,
  ...props
}: SectionProps) {
  const Comp = asChild ? Slot : "section";

  return (
    <Comp
      data-name={name}
      data-slot="section"
      id={name?.toLowerCase().replace(/ /g, "-")}
      className={cn(
        "relative flex scroll-m-20 flex-col gap-y-8",
        "before:font-mono after:font-mono",
        name && "py-10",
        name &&
          "before:absolute before:top-0 before:block before:h-4 before:text-foreground-faint before:text-xs before:uppercase before:tracking-widest before:content-['<<<'attr(data-name)'>>>']",
        name &&
          "after:absolute after:bottom-0 after:block after:h-4 after:text-foreground-faint after:text-xs after:uppercase after:tracking-widest after:content-['<<</'attr(data-name)'>>>']",
        className,
      )}
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
    <header className={cn("flex flex-col gap-3", className)} {...props}>
      {children}
    </header>
  );
}

interface SectionTitleProps
  extends React.ComponentProps<"h1">,
    VariantProps<typeof textVariants> {
  asChild?: boolean;
}

export function SectionTitle({
  children,
  className,
  asChild,
  invisibles,
  variant = "h1",
  ...props
}: SectionTitleProps) {
  const Comp = asChild ? Slot : "h1";

  return (
    <Comp
      className={cn(textVariants({ variant, invisibles }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

interface SectionDescriptionProps
  extends React.ComponentProps<"p">,
    Omit<VariantProps<typeof textVariants>, "variant"> {
  asChild?: boolean;
}

export function SectionDescription({
  children,
  className,
  asChild,
  invisibles,
  ...props
}: SectionDescriptionProps) {
  const Comp = asChild ? Slot : "p";

  return (
    <Comp
      className={cn(
        textVariants({ variant: "p", invisibles }),
        "text-foreground-subtle",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export const SectionSeparator = (
  props: React.ComponentProps<typeof Separator>,
) => {
  return <Separator {...props} />;
};
