import {
  DotsThreeOutlineVerticalIcon,
  GearIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MenuItemIcon, MenuItemLabel } from "../ui/menu";

interface PlaybookActionsDropdownProps {
  onSettingsClick: () => void;
  onDeleteClick: () => void;
}

export function PlaybookActionsDropdown({
  onSettingsClick,
  onDeleteClick,
}: PlaybookActionsDropdownProps) {
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
          <DropdownMenuItem onSelect={onSettingsClick}>
            <MenuItemIcon>
              <GearIcon />
            </MenuItemIcon>
            <MenuItemLabel>Settings</MenuItemLabel>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDeleteClick}>
            <MenuItemIcon>
              <TrashIcon />
            </MenuItemIcon>
            <MenuItemLabel>Delete</MenuItemLabel>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
