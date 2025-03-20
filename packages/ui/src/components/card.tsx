import React from "react";

import { cn } from "@/lib/cn";
import { Slot } from "@radix-ui/react-slot";

interface CardProps extends React.ComponentPropsWithRef<"div"> {
  interactive?: boolean;
  asChild?: boolean;
}

export function Card({ interactive = false, asChild, className, ...props }: CardProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "flex select-none flex-col justify-between gap-y-8 rounded-[13px] border border-gray-a3 bg-gradient-to-br bg-gray-1 from-gray-a2 to-gray-a1 p-5 shadow-none transition-all duration-200 ease-in-out",
        interactive &&
          "outline-none hover:border-gray-a4 hover:bg-gray-1 hover:from-gray-1 hover:to-gray-1 hover:shadow-[0px_0px_20px_6px_rgba(60,_30,_0,_0.05)] focus-visible:border-gray-a4 focus-visible:bg-gray-1 focus-visible:from-gray-1 focus-visible:to-gray-1 focus-visible:shadow-[0px_0px_20px_6px_rgba(60,_30,_0,_0.05)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentPropsWithRef<"div">) {
  return <div className={cn("flex flex-col gap-y-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentPropsWithRef<"h3">) {
  return <h3 className={cn("text-balance font-medium text-[15px] leading-5", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentPropsWithRef<"p">) {
  return <p className={cn("text-pretty text-[14px] text-gray-a11 leading-5", className)} {...props} />;
}
