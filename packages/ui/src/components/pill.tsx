import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";

const pillVariants = cva(["inline-flex select-none items-center whitespace-pre rounded-full px-2.5 font-medium", "[&>svg]:pointer-events-none [&>svg]:shrink-0"], {
  variants: {
    variant: {
      default: "bg-gray-a11 text-gray-1",
      secondary: "bg-gray-a4 text-gray-a11",
      success: "bg-green-a3 text-green-a11",
      destructive: "bg-red-a4 text-red-a11",
    },
    size: {
      default: "h-7 gap-x-1.5 text-sm leading-7 has-[svg:first-child]:pl-2 [&>svg]:size-4",
      md: "h-6 gap-x-1.5 px-2.5 text-[13px] leading-6 has-[svg:first-child]:pl-2 [&>svg]:size-3",
      sm: "h-5 gap-x-1.5 px-2 text-[11px] leading-5 has-[svg:first-child]:pl-1.5 [&>svg]:size-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface PillProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof pillVariants> {}

function Pill({ className, variant, size, ...props }: PillProps) {
  return <div className={cn(pillVariants({ variant, size }), className)} {...props} />;
}

export function PillGroup({ className, children, ...props }: React.ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export { Pill, pillVariants };
