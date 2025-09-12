import { McpDeleteConfirmation } from "@/components/mcp-servers/mcp-delete-confirmation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuItemIcon, MenuItemLabel } from "@/components/ui/menu";
import { DotsThreeOutlineVerticalIcon, TrashIcon } from "@phosphor-icons/react";

interface WorkspaceTargetDetailDropDownMenuProps {
  onDelete: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceTargetDetailDropDownMenu({
  onDelete: onConfirm,
  open,
  onOpenChange,
}: WorkspaceTargetDetailDropDownMenuProps) {
  return (
    <McpDeleteConfirmation
      onConfirm={onConfirm}
      open={open}
      onOpenChange={onOpenChange}
    >
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
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <MenuItemIcon>
                <TrashIcon />
              </MenuItemIcon>
              <MenuItemLabel onClick={() => onOpenChange(true)}>
                Delete
              </MenuItemLabel>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </McpDeleteConfirmation>
  );
}
