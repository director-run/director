import { Settings2 } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router";
import { useConnectionContext } from "./connection/connection-provider";

// This is sample data.
const data = {
  navMain: [],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { servers } = useConnectionContext();
  const { pathname } = useLocation();

  return (
    <Sidebar className="!border-r-0" {...props}>
      <SidebarHeader>
        <SidebarTrigger />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>MCP Servers</SidebarGroupLabel>
          <SidebarMenu>
            {servers.map((server) => (
              <SidebarMenuItem key={server.id}>
                <SidebarMenuButton
                  isActive={pathname === `/proxies/${server.id}`}
                  asChild
                >
                  <NavLink to={`/proxies/${server.id}`}>
                    <span>{server.name}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarFooter>
    </Sidebar>
  );
}
