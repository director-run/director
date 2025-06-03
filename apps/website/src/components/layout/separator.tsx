import { Root as SeparatorRoot } from "@radix-ui/react-separator";
import { ComponentProps } from "react";

import { Pattern, PatternDefsProps } from "@/components/ui/pattern";
import { cn } from "@/lib/cn";

interface SeparatorProps extends Omit<ComponentProps<"div">, "children"> {
  pattern: Omit<PatternDefsProps, "id">;
}

export function Separator({ pattern, className, ...props }: SeparatorProps) {
  return (
    <SeparatorRoot
      className={cn("relative h-4 w-full text-fg/15", className)}
      {...props}
    >
      <Pattern className="absolute inset-0 text-current" {...pattern} />
    </SeparatorRoot>
  );
}
