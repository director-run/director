"use client";

import {
  BookOpenTextIcon,
  GithubLogoIcon,
  MegaphoneSimpleIcon,
  PlusIcon,
  SidebarIcon,
} from "@phosphor-icons/react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  Menu,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuLabel,
} from "@/components/ui/menu";
import { ScrambleText } from "@/components/ui/scramble-text";
import { Sheet, SheetPortal, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";
import { useParams, usePathname } from "next/navigation";

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
          <SidebarContent />
        </SheetPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}

export function SidebarContent() {
  const pathname = usePathname();
  const { proxyId } = useParams<{ proxyId?: string }>();
  const { data, isLoading, error } = trpc.store.getAll.useQuery();

  const showLoading = isLoading || error?.message === "Failed to fetch";

  return (
    <div className="flex h-full w-full shrink-0 flex-col gap-y-6 px-4 pt-6 *:last:pb-4">
      <div className="px-2">
        <Logo className="size-6" />
      </div>

      <Menu>
        <MenuLabel label="Library" />
        <MenuItem
          data-state={pathname.startsWith("/library") ? "active" : "inactive"}
          asChild
        >
          <Link href="/library">
            <MenuItemIcon>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9.22783 1.84903C10.438 0.698788 12.3519 0.717222 13.5394 1.9047L13.595 1.96134C14.2699 2.67128 14.5382 3.62317 14.4085 4.52872C15.3143 4.39869 16.2666 4.66906 16.9769 5.34415L17.0335 5.39982L17.0706 5.43595L17.1263 5.49259C18.2584 6.68354 18.2583 8.55649 17.1263 9.74747L17.0706 9.80411L10.7483 16.1264L10.722 16.1586C10.6694 16.2385 10.6781 16.3471 10.7483 16.4174L12.0472 17.7152C12.2882 17.9565 12.2882 18.3481 12.0472 18.5893C11.806 18.8305 11.4144 18.8303 11.1731 18.5893L9.87529 17.2904C9.32116 16.7363 9.31205 15.8434 9.84892 15.2787L16.1966 8.93107L16.2298 8.89689C16.92 8.17086 16.9089 7.0225 16.1966 6.30997L16.1604 6.27286L16.1263 6.23966C15.4027 5.55186 14.2593 5.56013 13.5462 6.26505L13.5394 6.27286L8.26005 11.5522L8.23759 11.5736C7.99507 11.7928 7.61976 11.7859 7.38603 11.5522C7.14492 11.311 7.14501 10.9194 7.38603 10.6781L12.6653 5.39982L12.6985 5.36564C13.3887 4.63962 13.3776 3.49123 12.6653 2.77872V2.77775C11.953 2.06552 10.8045 2.05457 10.0784 2.74454L10.0442 2.77872L3.054 9.76798L3.03154 9.78946C2.78907 10.0085 2.41469 10.0016 2.18095 9.76798C1.93968 9.52671 1.93968 9.13523 2.18095 8.89396L9.17021 1.9047L9.22783 1.84903ZM10.9407 3.63028C11.1832 3.41123 11.5576 3.41825 11.7913 3.65177C12.0326 3.89304 12.0326 4.28452 11.7913 4.52579L6.62236 9.69474C5.8986 10.4185 5.89854 11.593 6.62236 12.3168C7.34618 13.0402 8.51976 13.0404 9.24345 12.3168L14.4124 7.14689C14.6537 6.90563 15.0452 6.90562 15.2864 7.14689C15.5276 7.38816 15.5277 7.77965 15.2864 8.02091L10.1165 13.1899C8.92901 14.3772 7.01516 14.3958 5.80498 13.2455L5.74834 13.1899C4.54215 11.9835 4.5421 10.028 5.74834 8.82169L10.9173 3.65177L10.9407 3.63028Z"
                  fill="currentcolor"
                />
              </svg>
            </MenuItemIcon>
            <MenuItemLabel>MCP</MenuItemLabel>
          </Link>
        </MenuItem>
      </Menu>

      <Menu>
        <MenuLabel label="Servers" />
        {showLoading
          ? new Array(3).fill(0).map((_, index) => (
              <MenuItem key={`loading-${index}`} className="bg-accent-subtle">
                <MenuItemLabel className="opacity-50">
                  <ScrambleText text="Loading" />
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
                  <Link href={`/${server.id}`}>
                    <MenuItemLabel>{server.name}</MenuItemLabel>
                  </Link>
                </MenuItem>
              );
            })}
      </Menu>

      <Menu className="mt-auto">
        <MenuItem
          data-state={pathname === "/new" ? "active" : "inactive"}
          asChild
        >
          <Link href="/new">
            <MenuItemIcon>
              <PlusIcon />
            </MenuItemIcon>
            <MenuItemLabel>New server</MenuItemLabel>
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link
            href="https://docs.director.run"
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

export function Layout({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
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
        <SidebarContent />
      </div>
      <div
        data-slot="layout-content"
        className="flex grow flex-col overflow-hidden p-2 md:pl-px"
      >
        {children}
      </div>
    </div>
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
  return (
    <div
      className={cn(
        "flex shrink-0 flex-row items-center gap-x-2",
        "h-13 border-accent border-b-[0.5px] bg-surface px-4 md:px-8 lg:px-12",
        className,
      )}
      {...props}
    >
      <SidebarSheet>
        <Button size="icon" variant="ghost">
          <SidebarIcon weight="fill" className="!size-5 shrink-0" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      </SidebarSheet>
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
