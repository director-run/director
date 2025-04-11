"use client";

import { ConnectionProvider } from "@/components/providers/connection-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IconContext } from "@phosphor-icons/react";
import { NuqsAdapter } from "nuqs/adapters/next";
import { ThemeProvider } from "./theme-provider";
import { TRPCProvider } from "./trpc-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <IconContext.Provider value={{ size: 16, weight: "bold" }}>
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
