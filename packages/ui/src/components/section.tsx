import { cn } from "@/lib/cn";
import { type VariantProps, cva } from "class-variance-authority";
import React from "react";

const sectionVariants = cva("mx-auto flex w-full flex-col gap-y-6", {
  variants: {
    width: {
      default: "max-w-5xl",
    },
  },
});

type SectionVariants = VariantProps<typeof sectionVariants>;

interface SectionProps extends React.ComponentPropsWithRef<"section"> {
  width?: SectionVariants["width"];
}

function Section({ children, className, width = "default", ...props }: SectionProps) {
  return (
    <section className={cn(sectionVariants({ width }), className)} {...props}>
      {children}
    </section>
  );
}

function SectionHeader({ children, className, ...props }: React.ComponentPropsWithRef<"header">) {
  return (
    <header className={cn("flex flex-row items-center gap-x-3", className)} {...props}>
      {children}
    </header>
  );
}

function SectionTitle({ children, className, ...props }: React.ComponentPropsWithRef<"h2">) {
  return (
    <h2 className={cn("select-none text-[21px] text-gray-a12 leading-7", className)} {...props}>
      {children}
    </h2>
  );
}

function SectionActions({ children, className, ...props }: React.ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("ml-auto flex flex-row gap-x-2", className)} {...props}>
      {children}
    </div>
  );
}

export { Section, SectionHeader, SectionTitle, SectionActions, sectionVariants, type SectionVariants };
