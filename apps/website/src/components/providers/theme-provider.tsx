"use client";

import { TooltipProvider } from "@director.run/ui/primitives/tooltip";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <TooltipProvider>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </TooltipProvider>
  );
}
