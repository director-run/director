import type { PlaybookTarget } from "@director.run/design/components/types.js";
import type { PlaybookDetail } from "@director.run/design/components/types.js";
import { Button } from "@director.run/design/components/ui/button.js";
import { ConfirmDialog } from "@director.run/design/components/ui/confirm-dialog.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@director.run/design/components/ui/dropdown-menu.js";
import {
  MenuItemIcon,
  MenuItemLabel,
} from "@director.run/design/components/ui/menu.js";
import { toast } from "@director.run/design/components/ui/toast.js";
import { DotsThreeOutlineVerticalIcon, TrashIcon } from "@phosphor-icons/react";
import { SignOutIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gatewayClient } from "../contexts/backend-context";
import { useAuthenticate } from "../hooks/use-authenticate";
import { useLogout } from "../hooks/use-logout";

interface PlaybookTargetDetailDropDownMenuProps {
  playbookTarget: PlaybookTarget;
  playbook: PlaybookDetail;
}

export function PlaybookTargetDetailDropDownMenu({
  playbookTarget,
  playbook,
}: PlaybookTargetDetailDropDownMenuProps) {
  const navigate = useNavigate();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const utils = gatewayClient.useUtils();

  const deleteServerMutation = gatewayClient.store.removeServer.useMutation({
    onSuccess: async () => {
      navigate(`/${playbook.id}`);

      await utils.store.get.invalidate({ playbookId: playbook.id });
      await utils.store.getAll.invalidate();

      toast({
        title: "Server deleted",
        description: "This server was successfully deleted.",
      });
    },
  });

  const handleDeleteServer = async () => {
    await deleteServerMutation.mutateAsync({
      playbookId: playbook.id,
      serverName: playbookTarget.name,
    });
  };

  const { logout } = useLogout();
  const { authenticate } = useAuthenticate();

  const handleLogoutServer = async () => {
    await logout({ playbookId: playbook.id, serverName: playbookTarget.name });
    setLogoutOpen(false);
    toast({
      title: "Logged out",
      description: "This server was successfully logged out.",
    });
  };

  return (
    <>
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
            {playbookTarget.type === "http" &&
              playbookTarget.connectionInfo?.isAuthenticated && (
                <DropdownMenuItem>
                  <MenuItemIcon>
                    <SignOutIcon />
                  </MenuItemIcon>
                  <MenuItemLabel onClick={() => setLogoutOpen(true)}>
                    Logout
                  </MenuItemLabel>
                </DropdownMenuItem>
              )}
            {playbookTarget.type === "http" &&
              !playbookTarget.connectionInfo?.isAuthenticated && (
                <DropdownMenuItem>
                  <MenuItemLabel
                    onClick={async () => {
                      await authenticate({
                        playbookId: playbook.id,
                        serverName: playbookTarget.name,
                      });
                    }}
                  >
                    Authenticate
                  </MenuItemLabel>
                </DropdownMenuItem>
              )}
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <MenuItemIcon>
                <TrashIcon />
              </MenuItemIcon>
              <MenuItemLabel onClick={() => setDeleteOpen(true)}>
                Delete
              </MenuItemLabel>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        title="Delete this server"
        description="Are you sure you want to delete this server? This action cannot be undone."
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteServer}
      />
      <ConfirmDialog
        title="Logout this server"
        description="Are you sure you want to logout this server? This action cannot be undone."
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogoutServer}
      />
    </>
  );
}
