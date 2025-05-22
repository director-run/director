import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-x-1 whitespace-nowrap rounded-md px-2 transition-colors duration-200",
    "h-6 font-mono text-xs uppercase leading-4 tracking-wide",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-background",
        secondary: "bg-element text-foreground",
        inverse: "bg-background text-foreground",
        yellow:
          "bg-accent-yellow/15 text-accent-yellow dark:bg-accent-yellow/70 dark:text-foreground",
        orange:
          "bg-accent-orange/15 text-accent-orange dark:bg-accent-orange/70 dark:text-foreground",
        tomato:
          "bg-accent-tomato/15 text-accent-tomato dark:bg-accent-tomato/70 dark:text-foreground",
        red: "bg-accent-red/15 text-accent-red dark:bg-accent-red/70 dark:text-foreground",
        ruby: "bg-accent-ruby/15 text-accent-ruby dark:bg-accent-ruby/70 dark:text-foreground",
        crimson:
          "bg-accent-crimson/15 text-accent-crimson dark:bg-accent-crimson/70 dark:text-foreground",
        pink: "bg-accent-pink/15 text-accent-pink dark:bg-accent-pink/70 dark:text-foreground",
        plum: "bg-accent-plum/15 text-accent-plum dark:bg-accent-plum/70 dark:text-foreground",
        purple:
          "bg-accent-purple/15 text-accent-purple dark:bg-accent-purple/70 dark:text-foreground",
        violet:
          "bg-accent-violet/15 text-accent-violet dark:bg-accent-violet/70 dark:text-foreground",
        iris: "bg-accent-iris/15 text-accent-iris dark:bg-accent-iris/70 dark:text-foreground",
        indigo:
          "bg-accent-indigo/15 text-accent-indigo dark:bg-accent-indigo/70 dark:text-foreground",
        blue: "bg-accent-blue/15 text-accent-blue dark:bg-accent-blue/70 dark:text-foreground",
        cyan: "bg-accent-cyan/15 text-accent-cyan dark:bg-accent-cyan/70 dark:text-foreground",
        teal: "bg-accent-teal/15 text-accent-teal dark:bg-accent-teal/70 dark:text-foreground",
        jade: "bg-accent-jade/15 text-accent-jade dark:bg-accent-jade/70 dark:text-foreground",
        green:
          "bg-accent-green/15 text-accent-green dark:bg-accent-green/70 dark:text-foreground",
        grass:
          "bg-accent-grass/15 text-accent-grass dark:bg-accent-grass/70 dark:text-foreground",
        lime: "bg-accent-lime/15 text-accent-lime dark:bg-accent-lime/70 dark:text-foreground",
        mint: "bg-accent-mint/15 text-accent-mint dark:bg-accent-mint/70 dark:text-foreground",
        sky: "bg-accent-sky/15 text-accent-sky dark:bg-accent-sky/70 dark:text-foreground",
      },
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
