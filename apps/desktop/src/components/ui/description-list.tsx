import React from "react";

import { cn } from "@/lib/cn";

export function DescriptionList({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"dl">) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 items-start *:border-gray-4 *:border-b *:py-3 *:text-sm *:leading-5 md:grid-cols-4",
        "[&>dd:first-of-type]:border-t md:[&>dd]:col-span-3",
        "[&>dt:first-child]:border-t [&>dt]:font-normal [&>dt]:text-gray-11",
        className,
      )}
      {...props}
    >
      {children}
    </dl>
  );
}

export function DescriptionTerm({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"dt">) {
  return (
    <dt className={cn(className)} {...props}>
      {children}
    </dt>
  );
}

export function DescriptionDetail({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"dd">) {
  return (
    <dd className={cn(className)} {...props}>
      {children}
    </dd>
  );
}
