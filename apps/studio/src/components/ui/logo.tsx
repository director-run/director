import { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export function Logo({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      className={cn("h-6", className)}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      {...props}
    >
      <path
        d="M0 0H195V195H0V0ZM95.3033 84.6967L157.5 146.893V82.5H172.5V172.5H82.5V157.5H146.893L84.6967 95.3033L95.3033 84.6967ZM15 210L45 240H240V45L210 15V210H15Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SimpleLogo({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      className={cn("h-6", className)}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      {...props}
    >
      <path
        d="M0 0H240V240H0V0ZM117.296 104.242L193.846 180.792V101.538H212.308V212.308H101.538V193.846H180.792L104.242 117.296L117.296 104.242Z"
        fill="currentColor"
      />
    </svg>
  );
}
