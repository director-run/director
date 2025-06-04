import { cn } from "@/lib/cn";
import { Slot } from "@radix-ui/react-slot";
import { ComponentProps } from "react";

interface ContainerProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export function Container({ asChild, className, ...props }: ContainerProps) {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      data-slot="container"
      className={cn(
        "mx-auto w-full max-w-6xl px-5 md:px-12 lg:px-20",
        className,
      )}
      {...props}
    />
  );
}
