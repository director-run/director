"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/icons/logo";
import {
  Menu,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuLabel,
} from "@/components/ui/menu";
import { ScrambleText } from "@/components/ui/scramble-text";
import { Sheet, SheetPortal, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/helpers/cn";
import {
  BookOpenTextIcon,
  GithubLogoIcon,
  PlusIcon,
  SidebarIcon,
} from "@phosphor-icons/react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useParams, usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { MCPIcon } from "../ui/icons/mcp-icon";

interface LayoutNavigationProps extends ComponentProps<"div"> {
  servers?: Server[];
  isLoading?: boolean;
  error?: string | null;
  onLibraryClick?: () => void;
  onServerClick?: (serverId: string) => void;
  onNewServerClick?: () => void;
  onDocumentationClick?: () => void;
  onGithubClick?: () => void;
}

export function LayoutNavigation({
  className,
  children,
  servers,
  isLoading,
  error,
  onLibraryClick,
  onServerClick,
  onNewServerClick,
  onDocumentationClick,
  onGithubClick,
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
      <SidebarSheet
        servers={servers}
        isLoading={isLoading}
        error={error}
        onLibraryClick={onLibraryClick}
        onServerClick={onServerClick}
        onNewServerClick={onNewServerClick}
        onDocumentationClick={onDocumentationClick}
        onGithubClick={onGithubClick}
      >
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
  servers?: Server[];
  isLoading?: boolean;
  error?: string | null;
  onLibraryClick?: () => void;
  onServerClick?: (serverId: string) => void;
  onNewServerClick?: () => void;
  onDocumentationClick?: () => void;
  onGithubClick?: () => void;
}

function SidebarSheet({
  children,
  servers,
  isLoading,
  error,
  onLibraryClick,
  onServerClick,
  onNewServerClick,
  onDocumentationClick,
  onGithubClick,
  ...props
}: SidebarSheetProps) {
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
          <SidebarContent
            servers={servers}
            isLoading={isLoading}
            error={error}
            onLibraryClick={onLibraryClick}
            onServerClick={onServerClick}
            onNewServerClick={onNewServerClick}
            onDocumentationClick={onDocumentationClick}
            onGithubClick={onGithubClick}
          />
        </SheetPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}

interface Server {
  id: string;
  name: string;
}

interface SidebarContentProps {
  servers?: Server[];
  isLoading?: boolean;
  error?: string | null;
  onLibraryClick?: () => void;
  onServerClick?: (serverId: string) => void;
  onNewServerClick?: () => void;
  onDocumentationClick?: () => void;
  onGithubClick?: () => void;
}

export function SidebarContent({
  servers,
  isLoading,
  error,
  onLibraryClick,
  onServerClick,
  onNewServerClick,
  onDocumentationClick,
  onGithubClick,
}: SidebarContentProps) {
  const pathname = usePathname();
  const { proxyId } = useParams<{ proxyId?: string }>();

  const showLoading = isLoading || error === "Failed to fetch";

  return (
    <div className="flex h-full w-full shrink-0 flex-col gap-y-6 px-4 pt-6 *:last:pb-4">
      <div className="px-2">
        <Logo className="size-6" />
      </div>

      <Menu>
        <MenuLabel label="Library" />
        <MenuItem
          data-state={pathname.startsWith("/library") ? "active" : "inactive"}
          onClick={onLibraryClick}
        >
          <MenuItemIcon>
            <MCPIcon />
          </MenuItemIcon>
          <MenuItemLabel>MCP</MenuItemLabel>
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
          : servers?.map((server) => {
              const isActive = server.id === proxyId;
              return (
                <MenuItem
                  key={server.id}
                  data-state={isActive ? "active" : "inactive"}
                  onClick={() => onServerClick?.(server.id)}
                >
                  <MenuItemLabel>{server.name}</MenuItemLabel>
                </MenuItem>
              );
            })}
      </Menu>

      <Menu className="mt-auto">
        <MenuItem
          data-state={pathname === "/new" ? "active" : "inactive"}
          onClick={onNewServerClick}
        >
          <MenuItemIcon>
            <PlusIcon />
          </MenuItemIcon>
          <MenuItemLabel>New server</MenuItemLabel>
        </MenuItem>
        <MenuItem onClick={onDocumentationClick}>
          <MenuItemIcon>
            <BookOpenTextIcon weight="fill" />
          </MenuItemIcon>
          <MenuItemLabel>Documentation</MenuItemLabel>
        </MenuItem>
        <MenuItem onClick={onGithubClick}>
          <MenuItemIcon>
            <GithubLogoIcon />
          </MenuItemIcon>
          <MenuItemLabel>Github</MenuItemLabel>
        </MenuItem>
      </Menu>
    </div>
  );
}
