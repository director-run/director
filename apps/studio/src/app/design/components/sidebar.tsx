"use client";

import { Logo } from "@/components/ui/logo";
import { Sheet, SheetPortal, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";
import {
  BookOpenTextIcon,
  GithubLogoIcon,
  MegaphoneSimpleIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ComponentProps, ReactNode } from "react";
import {
  DialogOverlay,
  Menu,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuLabel,
} from "./primitives";
import { ScrambleText } from "./scramble-text";

interface SidebarSheetProps extends ComponentProps<typeof Sheet> {
  children?: ReactNode;
}

export function SidebarSheet({ children, ...props }: SidebarSheetProps) {
  return (
    <Sheet {...props}>
      {children && (
        <SheetTrigger className="md:hidden" asChild>
          {children}
        </SheetTrigger>
      )}
      <SheetPortal>
        <DialogOverlay />
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
          <SidebarContent />
        </SheetPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}

export function SidebarContent() {
  const { proxyId } = useParams<{ proxyId?: string }>();
  const { data, isLoading, error } = trpc.store.getAll.useQuery();

  const showLoading = isLoading || error?.message === "Failed to fetch";

  return (
    <div className="flex h-full w-full shrink-0 flex-col gap-y-6 px-4 pt-6 *:last:pb-4">
      <div className="px-2">
        <Logo className="size-6" />
      </div>

      <Menu>
        <MenuLabel label="Servers" />
        {showLoading
          ? new Array(3).fill(0).map((_, index) => (
              <MenuItem key={`loading-${index}`} className="bg-accent-subtle">
                <MenuItemLabel className="opacity-50">
                  <ScrambleText scrambleSpeed={100} text="Loading" />
                </MenuItemLabel>
              </MenuItem>
            ))
          : data?.map((server) => {
              const isActive = server.id === proxyId;
              return (
                <MenuItem
                  key={server.id}
                  data-state={isActive ? "active" : "inactive"}
                  asChild
                >
                  <Link href={`/proxies/${server.id}`}>
                    <MenuItemLabel>{server.name}</MenuItemLabel>
                  </Link>
                </MenuItem>
              );
            })}
      </Menu>

      <Menu className="mt-auto">
        <MenuItem asChild>
          <Link href="/proxies/new">
            <MenuItemIcon>
              <PlusIcon />
            </MenuItemIcon>
            <MenuItemLabel>New server</MenuItemLabel>
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link
            href="https://director.run"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MenuItemIcon>
              <BookOpenTextIcon weight="fill" />
            </MenuItemIcon>
            <MenuItemLabel>Documentation</MenuItemLabel>
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link
            href="https://github.com/theworkingcompany/director/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MenuItemIcon>
              <MegaphoneSimpleIcon />
            </MenuItemIcon>
            <MenuItemLabel>Give feedback</MenuItemLabel>
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link
            href="https://github.com/theworkingcompany/director"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MenuItemIcon>
              <GithubLogoIcon />
            </MenuItemIcon>
            <MenuItemLabel>Github</MenuItemLabel>
          </Link>
        </MenuItem>
      </Menu>
    </div>
  );
}
