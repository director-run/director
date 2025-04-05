"use client";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { MegaphoneIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { NavLink, Outlet, useParams } from "react-router";
import { useConnectionContext } from "../connection/connection-provider";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";

function ServerSelector() {
  const { id } = useParams<{ id: string }>();
  const { servers } = useConnectionContext();

  const currentServer = servers.find((server) => server.name === id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">{currentServer?.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {servers.map((it) => {
            return (
              <DropdownMenuItem key={it.id} asChild>
                <NavLink to={`/proxies/${it.name}`}>{it.name}</NavLink>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuItem asChild>
            <NavLink to="/proxies/new">
              <PlusIcon />
              New server
            </NavLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <SettingsIcon />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <MegaphoneIcon />
            <span>Give feedback</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MainLayout() {
  return (
    <ScrollArea className="h-svh w-full overflow-hidden">
      <div className="absolute top-4 left-4 z-50">
        <ServerSelector />
      </div>

      <div className="flex min-h-svh items-center justify-center py-14">
        <Outlet />
      </div>
    </ScrollArea>
  );
}
