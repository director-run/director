import { ConnectionProvider } from "@/components/connection/connection-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCProvider } from "@/lib/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { Outlet } from "react-router";
import { ThemeToggle } from "../theme-toggle";
import { ThemeProvider } from "./theme-provider";

export function AppProviders() {
  return (
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <NuqsAdapter>
          <TRPCProvider>
            <ConnectionProvider>
              <Outlet />
            </ConnectionProvider>
          </TRPCProvider>
        </NuqsAdapter>
        <Toaster position="bottom-center" />
        <ThemeToggle />
      </TooltipProvider>
    </ThemeProvider>
  );
}
