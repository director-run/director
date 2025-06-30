import { cn } from "@director.run/design/lib/cn";
import { type VariantProps, cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

const cardVariants = cva(
  [
    "@container/card group/card flex flex-col rounded-lg text-left text-content-primary shadow-hairline",
    "data-[interactive]:focus-visible data-[interactive]:transition-[box-shadow,_background-color] data-[interactive]:duration-150 data-[interactive]:ease-in-out data-[interactive]:hover:shadow-popover dark:data-[interactive]:hover:bg-surface-neutral/50",
  ],
  {
    variants: {
      variant: {
        default: "bg-surface",
        subtle: "bg-surface-subtle",
        neutral: "bg-surface-neutral",
        forest: "bg-forest text-green",
        green: "bg-green text-forest",
        lagoon: "bg-lagoon text-beira",
        beira: "bg-beira text-lagoon",
        slate: "bg-slate text-sunflower",
        sunflower: "bg-sunflower text-slate",
        wine: "bg-wine text-rose",
        rose: "bg-rose text-wine",
        spruce: "bg-spruce text-lime",
        lime: "bg-lime text-spruce",
        negative: "bg-sentiment-negative text-base-light",
        positive: "bg-sentiment-positive text-base-light",
        warning: "bg-sentiment-warning text-base-dark",
      },
      spacing: {
        none: "p-0",
        xs: "p-2",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      spacing: "md",
    },
  },
);
type CardVariants = VariantProps<typeof cardVariants>;

interface CardProps extends ComponentProps<"div">, CardVariants {
  asChild?: boolean;
  interactive?: boolean;
}

export function Card({
  className,
  asChild,
  variant,
  spacing,
  interactive,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      className={cn(cardVariants({ variant, spacing, className }))}
      data-interactive={interactive}
      data-slot="card"
      {...props}
    />
  );
}
