import { ConnectionProvider } from "@/components/providers/connection-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCProvider } from "@/lib/trpc/client";
import { IconContext } from "@phosphor-icons/react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <IconContext.Provider value={{ size: 16, weight: "light" }}>
        <TooltipProvider>
          <NuqsAdapter>
            <TRPCProvider>
              <ConnectionProvider>{children}</ConnectionProvider>
            </TRPCProvider>
          </NuqsAdapter>
          <Toaster position="bottom-center" />
        </TooltipProvider>
      </IconContext.Provider>
    </ThemeProvider>
  );
}
