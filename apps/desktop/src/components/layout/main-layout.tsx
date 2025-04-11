"use client";
import { CaretDown } from "@phosphor-icons/react";
import { PlusIcon } from "lucide-react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import {
  useConnectionContext,
  useCurrentServer,
} from "../providers/connection-provider";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";

function ServerSelector() {
  const { servers } = useConnectionContext();
  const currentServer = useCurrentServer();

  if (!currentServer) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex cursor-pointer items-center gap-1 gap-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-background/50 radix-state-open:bg-secondary px-3 py-1.5 font-medium text-base text-token-text-secondary backdrop-blur-lg hover:bg-secondary">
        <span className="block max-w-[16ch] truncate">
          {currentServer.name}
        </span>
        <CaretDown
          className="shrink-0 text-muted-foreground/70"
          weight="bold"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-xs"
      >
        <DropdownMenuGroup className="min-w-0">
          {servers.map((it) => {
            return (
              <DropdownMenuItem key={it.id} asChild>
                <NavLink to={`/${it.id}`}>
                  <span className="truncate">{it.name}</span>
                </NavLink>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <NavLink to="/new">
              <PlusIcon />
              New server
            </NavLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProxyHeader() {
  return (
    <div className="sticky top-0 z-40 flex flex-row justify-between p-3">
      <ServerSelector />
      <div className="">Settings goes here</div>
    </div>
  );
}

function BackHeader() {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 flex flex-row justify-between p-3">
      <Button variant="secondary" onClick={() => navigate(-1)}>
        Back
      </Button>
    </div>
  );
}

export function MainLayout() {
  const { pathname } = useLocation();
  const params = useParams<{ proxyId: string }>();

  const isProxyPath = params.proxyId !== undefined;
  const isNewProxyPath = pathname === "/new";

  return (
    <ScrollArea className="h-svh w-full overflow-hidden">
      <div className="flex min-h-svh flex-col">
        {isProxyPath && <ProxyHeader />}
        {isNewProxyPath && <BackHeader />}
        <div className="flex grow items-center justify-center">
          <Outlet />
        </div>
      </div>
    </ScrollArea>
  );
}
