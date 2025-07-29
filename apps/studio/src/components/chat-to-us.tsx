"use client";

import {
  BugIcon,
  ChatCircleDotsIcon,
  DiscordLogoIcon,
  GithubLogoIcon,
  NewspaperClippingIcon,
  XLogoIcon,
} from "@phosphor-icons/react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MenuItemIcon, MenuItemLabel } from "./ui/menu";

export function ChatToUs() {
  return (
    <div className="fixed right-5 bottom-5 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="lg"
            className="size-10 rounded-full p-0"
          >
            <ChatCircleDotsIcon className="!size-5" weight="fill" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <a
                href="https://director.run/changelog"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MenuItemIcon>
                  <NewspaperClippingIcon />
                </MenuItemIcon>
                <MenuItemLabel>Latest updates</MenuItemLabel>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href="https://github.com/director-run/director/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MenuItemIcon>
                  <BugIcon />
                </MenuItemIcon>
                <MenuItemLabel>Report a bug</MenuItemLabel>
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <a
                href="https://discord.gg/RT5pQRpkJx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MenuItemIcon>
                  <DiscordLogoIcon />
                </MenuItemIcon>
                <MenuItemLabel>Join Discord</MenuItemLabel>
              </a>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <a
                href="https://github.com/director-run/director/discussions/new/choose"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MenuItemIcon>
                  <GithubLogoIcon />
                </MenuItemIcon>
                <MenuItemLabel>Start discussion</MenuItemLabel>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href="https://x.com/theworkingco"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MenuItemIcon>
                  <XLogoIcon />
                </MenuItemIcon>
                <MenuItemLabel>Follow on X/Twitter</MenuItemLabel>
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
