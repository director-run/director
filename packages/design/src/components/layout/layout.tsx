"use client";
import { SidebarIcon } from "@phosphor-icons/react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { ComponentProps } from "react";
import { createContext, useContext } from "react";
import { cn } from "../../helpers/cn";
import { Button } from "../ui/button";
import { Sheet, SheetPortal, SheetTrigger } from "../ui/sheet";
import { SidebarContent } from "./navigation";
import type { NavigationSection } from "./navigation";

const NavigationContext = createContext<NavigationSection[]>([]);

interface LayoutRootProps extends ComponentProps<"div"> {
  sections?: NavigationSection[];
}

export function LayoutRoot({
  className,
  children,
  sections = [],
  ...props
}: LayoutRootProps) {
  return (
    <NavigationContext.Provider value={sections}>
      <div
        data-slot="layout"
        className={cn(
          "flex h-screen w-screen flex-row overflow-hidden bg-bg text-fg",
          className,
        )}
        {...props}
      >
        <div
          data-slot="layout-sidebar"
          className={cn(
            "hidden w-full max-w-[220px] shrink-0 overflow-y-auto overflow-x-hidden md:flex",
          )}
        >
          <SidebarContent sections={sections} />
        </div>
        <div
          data-slot="layout-content"
          className="flex grow flex-col overflow-hidden p-2 md:pl-px"
        >
          {children}
        </div>
      </div>
    </NavigationContext.Provider>
  );
}

export function LayoutView({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "@container/page overflow-hidden text-fg",
        "flex grow flex-col rounded-md bg-surface shadow-[0_0_0_0.5px_rgba(55,50,46,0.2)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function LayoutViewHeader({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  const sections = useContext(NavigationContext);

  return (
    <div
      className={cn(
        "flex shrink-0 flex-row items-center gap-x-2",
        "h-13 border-accent border-b-[0.5px] bg-surface px-4 md:px-8 lg:px-12",
        className,
      )}
      {...props}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="md:hidden">
            <SidebarIcon weight="fill" className="!size-5 shrink-0" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetPortal>
          <SheetPrimitive.Overlay className="overlay" />
          <SheetPrimitive.Content
            className={cn(
              "fixed inset-y-0 left-0 z-50 h-full w-full max-w-[220px] bg-bg text-fg transition ease-in-out",
              "shadow-[0_0_10px_3px_rgba(55,50,46,0.13),_0_0_0_0.5px_rgba(55,50,46,0.2)] outline-none",
              "overflow-y-auto overflow-x-hidden",
              "radix-state-[closed]:slide-out-to-left radix-state-[closed]:animate-out radix-state-[closed]:duration-200",
              "radix-state-[open]:slide-in-from-left radix-state-[open]:animate-in radix-state-[open]:duration-300",
            )}
          >
            <VisuallyHidden>
              <SheetPrimitive.DialogTitle>
                Navigation
              </SheetPrimitive.DialogTitle>
              <SheetPrimitive.DialogDescription>
                A sidebar containing global navigation for Director studio.
              </SheetPrimitive.DialogDescription>
            </VisuallyHidden>
            <SidebarContent sections={sections} />
          </SheetPrimitive.Content>
        </SheetPortal>
      </Sheet>
      {children}
    </div>
  );
}

export function LayoutViewContent({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex grow flex-col overflow-y-auto overflow-x-hidden py-8 md:py-12 lg:py-16",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
