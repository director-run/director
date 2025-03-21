import { cn } from "@/lib/cn";
import React from "react";

export function Logo({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("h-6", className)} {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M0 0H195V195H0V0ZM95.3032 84.6968L157.5 146.894V82.5H172.5V172.5H82.5V157.5H146.894L84.6968 95.3032L95.3032 84.6968ZM15 210L45 240H240V45L210 15V210H15Z" fill="currentColor" />
    </svg>
  );
}
