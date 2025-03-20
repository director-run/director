import { cn } from "@/lib/cn";
import React from "react";

export function DescriptionList({ children, className, ...props }: React.ComponentPropsWithoutRef<"dl">) {
  return (
    <dl className={cn("grid grid-cols-2 *:border-gray-a4 *:border-b *:py-3 *:text-sm *:leading-6 lg:grid-cols-3", "[&>dd:first-of-type]:border-t lg:[&>dd]:col-span-2", "[&>dt:first-child]:border-t [&>dt]:font-medium [&>dt]:text-gray-a11", className)} {...props}>
      {children}
    </dl>
  );
}

export function DescriptionTerm({ children, className, ...props }: React.ComponentPropsWithoutRef<"dt">) {
  return (
    <dt className={cn(className)} {...props}>
      {children}
    </dt>
  );
}

export function DescriptionDetail({ children, className, ...props }: React.ComponentPropsWithoutRef<"dd">) {
  return (
    <dd className={cn(className)} {...props}>
      {children}
    </dd>
  );
}
