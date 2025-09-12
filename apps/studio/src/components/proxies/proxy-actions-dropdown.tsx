import {
  DotsThreeOutlineVerticalIcon,
  GearIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { StoreGet } from "../types";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MenuItemIcon, MenuItemLabel } from "../ui/menu";
import { ProxyDeleteConfirmation } from "./proxy-delete-confirmation";
import { ProxySettingsSheet } from "./proxy-settings-sheet";

interface ProxyActionsDropdownProps {
  proxy: StoreGet;
  onUpdateProxy: (values: {
    name: string;
    description?: string;
  }) => Promise<void>;
  onDeleteProxy: () => Promise<void>;
  isUpdating: boolean;
  settingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
}

export function ProxyActionsDropdown({
  proxy,
  onUpdateProxy,
  onDeleteProxy,
  isUpdating,
  settingsOpen,
  onSettingsOpenChange,
  deleteOpen,
  onDeleteOpenChange,
}: ProxyActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="radix-state-[open]:bg-accent-subtle"
        >
          <DotsThreeOutlineVerticalIcon weight="fill" className="!size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <ProxySettingsSheet
            proxy={proxy}
            onSubmit={onUpdateProxy}
            isSubmitting={isUpdating}
            open={settingsOpen}
            onOpenChange={onSettingsOpenChange}
          >
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <MenuItemIcon>
                <GearIcon />
              </MenuItemIcon>
              <MenuItemLabel>Settings</MenuItemLabel>
            </DropdownMenuItem>
          </ProxySettingsSheet>
          <ProxyDeleteConfirmation
            onConfirm={onDeleteProxy}
            open={deleteOpen}
            onOpenChange={onDeleteOpenChange}
          >
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <MenuItemIcon>
                <TrashIcon />
              </MenuItemIcon>
              <MenuItemLabel>Delete</MenuItemLabel>
            </DropdownMenuItem>
          </ProxyDeleteConfirmation>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
