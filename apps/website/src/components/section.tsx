import { cn } from "@director.run/ui/lib/cn";
import { Slot } from "@director.run/ui/primitives/slot";

interface SectionProps extends React.ComponentProps<"div"> {
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
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-name={name}
      data-slot="section"
      id={name?.toLowerCase().replace(/ /g, "-")}
      className={cn(
        "flex scroll-m-20 flex-col gap-y-4",
        name &&
          "before:text-gray-8 before:text-xs before:uppercase before:tracking-widest before:content-['<<<'attr(data-name)'>>>']",
        name &&
          "after:text-gray-8 after:text-xs after:uppercase after:tracking-widest after:content-['<<</'attr(data-name)'>>>']",
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
