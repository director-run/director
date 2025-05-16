import { Slot } from "@radix-ui/react-slot";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Children, ComponentProps, cloneElement, isValidElement } from "react";

import { cn } from "@/lib/cn";
import { cva } from "class-variance-authority";

interface ContentsProps extends ComponentProps<"ol"> {
  list?: "numerical" | "alphabetical";
  variant?: "default" | "inverse";
}

export function Contents({
  children,
  className,
  style,
  list = "alphabetical",
  variant = "default",
  ...props
}: ContentsProps) {
  return (
    <ol
      className={cn(
        "flex w-full select-none flex-col gap-y-1 overflow-hidden",
        className,
      )}
      style={{ counterReset: "count 0", ...style }}
      {...props}
    >
      {Children.map(children, (child) => {
        if (isValidElement<ContentsItemProps>(child)) {
          return cloneElement(child, {
            list,
            variant,
            ...(child.props as Record<string, unknown>),
          });
        }
        return child;
      })}
    </ol>
  );
}

const contentItemVariants = cva(
  [
    "group/contents-item flex flex-row gap-x-0.5",
    "*:font-mono *:text-xs *:uppercase *:tracking-wide",
    "*:transition-colors *:duration-200 *:ease-in-out",
    "before:flex before:size-7 before:shrink-0 before:grow-0 before:items-center before:justify-center before:font-mono before:text-xs before:uppercase",
    "before:transition-colors before:duration-200 before:ease-in-out",
    "[a&]:hover:before:bg-element-hover [a&]:hover:*:bg-element-hover",
  ],
  {
    variants: {
      list: {
        numerical: "before:content-[counter(count,_decimal)]",
        alphabetical: "before:content-[counter(count,_upper-alpha)]",
      },
      variant: {
        default: [
          "*:bg-element *:text-foreground before:bg-element before:text-foreground-subtle group-hover/contents-item:before:text-foreground",
        ],
        inverse: [
          "*:bg-background/20 *:text-foreground-inverse before:bg-background/20 before:text-foreground-inverse/70 group-hover/contents-item:before:text-foreground-inverse",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      list: "alphabetical",
    },
  },
);

interface ContentsItemProps extends ComponentProps<"li"> {
  asChild?: boolean;
  variant?: "default" | "inverse";
  list?: "numerical" | "alphabetical";
}

export function ContentsItem({
  asChild,
  children,
  className,
  style,
  variant = "default",
  list = "alphabetical",
  ...props
}: ContentsItemProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <li {...props} style={{ counterIncrement: "count 1", ...style }}>
      <Comp className={cn(contentItemVariants({ variant, list }), className)}>
        {children}
      </Comp>
    </li>
  );
}

export function ContentsItemLabel({
  className,
  children,
  truncate = true,
  ...props
}: ComponentProps<"span"> & { truncate?: boolean }) {
  return (
    <span className="w-full min-w-0 overflow-hidden">
      <span
        className={cn(
          "block text-pretty px-2 py-1.5",
          truncate && "truncate",
          className,
        )}
        {...props}
      >
        {children}
      </span>
    </span>
  );
}

interface ContentsItemLinkProps extends ContentsItemProps {
  href: string;
}

export function ContentsItemLink({
  className,
  children,
  href,
  ...props
}: ContentsItemLinkProps) {
  const isExternal = href.startsWith("http");

  return (
    <ContentsItem className={className} {...props} asChild>
      <Link href={href}>
        {children}
        <span
          className="flex size-7 shrink-0 grow-0 items-center justify-center text-foreground-faint group-hover/contents-item:text-foreground [&>svg]:size-4"
          aria-hidden
        >
          {isExternal ? <ArrowUpRight /> : <ArrowRight />}
        </span>
      </Link>
    </ContentsItem>
  );
}
