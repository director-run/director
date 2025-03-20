import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";

const buttonVariants = cva(["inline-flex items-center justify-center gap-2 whitespace-nowrap outline-none transition-colors duration-200 ease-in-out", "not-disabled:cursor-pointer disabled:pointer-events-none disabled:opacity-50", "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"], {
  variants: {
    variant: {
      default: "bg-gray-a12 text-gray-1",
      destructive: "",
      secondary: "bg-gray-a4 text-gray-a11 hover:bg-gray-a6 hover:text-gray-a12 focus-visible:bg-gray-a6 focus-visible:text-gray-a12",
      ghost: "",
    },
    size: {
      default: "h-7 rounded-[7px] px-2.5 text-sm leading-7",
      sm: "",
      lg: "",
      icon: "h-7 w-7 rounded-[5px]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps extends React.ComponentPropsWithRef<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = ({ className, variant, size, asChild = false, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
};

export { Button, buttonVariants };
