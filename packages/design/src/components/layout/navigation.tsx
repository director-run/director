"use client";

import { SidebarIcon } from "@phosphor-icons/react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../helpers/cn";
import { Button } from "../ui/button";
import { Logo } from "../ui/icons/logo";
import {
  Menu,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuLabel,
} from "../ui/menu";
import { ScrambleText } from "../ui/scramble-text";
import { Sheet, SheetPortal, SheetTrigger } from "../ui/sheet";

export interface NavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export interface NavigationSection {
  id: string;
  label?: string;
  items: NavigationItem[];
  isLoading?: boolean;
  className?: string;
}

interface LayoutNavigationProps extends ComponentProps<"div"> {
  sections?: NavigationSection[];
}

export function LayoutNavigation({
  className,
  children,
  sections = [],
  ...props
}: LayoutNavigationProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-row items-center gap-x-2",
        "h-13 border-accent border-b-[0.5px] bg-surface px-4 md:px-8 lg:px-12",
        className,
      )}
      {...props}
    >
      <SidebarSheet sections={sections}>
        <Button size="icon" variant="ghost">
          <SidebarIcon weight="fill" className="!size-5 shrink-0" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      </SidebarSheet>
      {children}
    </div>
  );
}

interface SidebarSheetProps extends ComponentProps<typeof Sheet> {
  children?: ReactNode;
  sections: NavigationSection[];
}

function SidebarSheet({ children, sections, ...props }: SidebarSheetProps) {
  return (
    <Sheet {...props}>
      {children && (
        <SheetTrigger className="md:hidden" asChild>
          {children}
        </SheetTrigger>
      )}
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
            <SheetPrimitive.DialogTitle>Navigation</SheetPrimitive.DialogTitle>
            <SheetPrimitive.DialogDescription>
              A sidebar containing global navigation for Director studio.
            </SheetPrimitive.DialogDescription>
          </VisuallyHidden>
          <SidebarContent sections={sections} />
        </SheetPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}

interface SidebarContentProps {
  sections: NavigationSection[];
}

export function SidebarContent({ sections }: SidebarContentProps) {
  return (
    <div className="flex h-full w-full shrink-0 flex-col gap-y-6 px-4 pt-6 *:last:pb-4">
      <div className="px-2">
        <Logo className="size-6" />
      </div>

      {sections.map((section, index) => (
        <Menu
          key={section.id}
          className={cn(
            section.className,
            index === sections.length - 1 ? "mt-auto" : undefined,
          )}
        >
          {section.label && <MenuLabel label={section.label} />}
          {section.isLoading
            ? new Array(3).fill(0).map((_, loadingIndex) => (
                <MenuItem
                  key={`loading-${loadingIndex}`}
                  className="bg-accent-subtle"
                >
                  <MenuItemLabel className="opacity-50">
                    <ScrambleText text="Loading" />
                  </MenuItemLabel>
                </MenuItem>
              ))
            : section.items.map((item) => (
                <MenuItem
                  key={item.id}
                  data-state={item.isActive ? "active" : "inactive"}
                  className="cursor-pointer"
                  onClick={item.onClick}
                >
                  {item.icon && <MenuItemIcon>{item.icon}</MenuItemIcon>}
                  <MenuItemLabel>{item.label}</MenuItemLabel>
                </MenuItem>
              ))}
        </Menu>
      ))}
    </div>
  );
}
