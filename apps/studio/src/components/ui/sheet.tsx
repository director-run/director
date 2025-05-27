"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/cn";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "./button";
import { textVariants } from "./typography";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay className={cn("overlay", className)} {...props} />
  );
}

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          "popover fixed inset-y-1 right-1 z-50 flex w-[calc(100%-0.5rem)] flex-col overflow-hidden rounded-xl transition ease-in-out sm:max-w-xl",
          "shadow-[0_0_10px_6px_rgba(55,50,46,0.13),_0_0_0_0.5px_rgba(55,50,46,0.25)]",
          "radix-state-[open]:slide-in-from-right radix-state-[open]:animate-in radix-state-[open]:duration-300",
          "radix-state-[closed]:slide-out-to-right radix-state-[closed]:animate-out radix-state-[closed]:duration-200",
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-y-10 overflow-y-auto overflow-x-hidden p-6 pt-10",
        className,
      )}
      {...props}
    />
  );
}

function SheetActions({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-row-reverse items-center justify-start gap-x-1 border-accent border-b-[0.5px] px-3 py-2",
        className,
      )}
      {...props}
    >
      <SheetClose asChild>
        <Button size="icon" variant="secondary">
          <XIcon />
          <span className="sr-only">Close</span>
        </Button>
      </SheetClose>
      {children}
    </div>
  );
}

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-y-2 text-left", className)}
    {...props}
  />
);

function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn(textVariants({ variant: "h1" }), className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn(
        textVariants({ variant: "p" }),
        "text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetBody,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetActions,
};
