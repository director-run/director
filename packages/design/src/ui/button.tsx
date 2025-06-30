import { Tooltip } from "@director.run/design/components/tooltip";
import { cn } from "@director.run/design/lib/cn";
import { Conditional } from "@director.run/design/lib/conditional";
import { type VariantProps, cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-x-2 whitespace-nowrap duration-200 will-change-auto",
    "focus-visible font-sans leading-none transition-colors duration-300 ease-out",
    "select-none rounded-md has-[.sr-only]:px-0",
    "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-interactive-primary radix-state-[open]:bg-interactive-primary-hover text-interactive-accent hover:bg-interactive-primary-hover",
          "dark:bg-interactive-accent dark:radix-state-[open]:bg-interactive-accent-hover dark:text-interactive-primary dark:hover:bg-interactive-accent-hover",
        ],
        accent: [
          "dark:bg-interactive-accent dark:radix-state-[open]:bg-interactive-accent-hover dark:text-interactive-primary dark:hover:bg-interactive-accent-hover",
          "bg-interactive-primary radix-state-[open]:bg-interactive-primary-hover text-interactive-accent hover:bg-interactive-primary-hover",
        ],
        secondary:
          "bg-interactive-secondary radix-state-[open]:bg-interactive-secondary-hover text-content-primary hover:bg-interactive-secondary-hover",
        tertiary:
          "bg-transparent radix-state-[open]:bg-interactive-secondary-hover text-content-secondary hover:bg-interactive-secondary",
        negative:
          "bg-sentiment-negative radix-state-[open]:bg-sentiment-negative-hover text-base-light hover:bg-sentiment-negative-hover",
        positive:
          "bg-sentiment-positive radix-state-[open]:bg-sentiment-positive-hover text-base-light hover:bg-sentiment-positive-hover",
        warning:
          "bg-sentiment-warning radix-state-[open]:bg-sentiment-warning-hover text-base-dark hover:bg-sentiment-warning-hover",
      },
      size: {
        xs: "h-6 px-1.5 font-[450] text-sm leading-snug has-[.sr-only]:size-6",
        sm: "h-7 px-2 font-[450] text-[13px] leading-snug has-[.sr-only]:size-7",
        md: "h-8 px-4 font-[450] text-[14px] leading-snug has-[.sr-only]:size-8",
        lg: "h-10 px-5 has-[.sr-only]:size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends ComponentProps<"button">, ButtonVariants {
  asChild?: boolean;
  tooltip?: string;
  tooltipProps?: Omit<ComponentProps<typeof Tooltip>, "value">;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  tooltip,
  tooltipProps,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Conditional
      condition={typeof tooltip === "string"}
      wrap={(children) => (
        <Tooltip value={tooltip as string} {...tooltipProps}>
          {children}
        </Tooltip>
      )}
    >
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    </Conditional>
  );
}

export { Button, buttonVariants };
