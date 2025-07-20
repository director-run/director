"use client";

import { cn } from "@director.run/design/lib/cn";
import { Button } from "@director.run/design/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@director.run/design/ui/dropdown-menu";
import { MoonIcon, SunIcon } from "lucide-react";

import { ModeToggle } from "./theme-toggle";

export function ThemeSwitcher({ className }: { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={cn("rounded-full", className)} variant="tertiary">
          <SunIcon className="dark:hidden" />
          <MoonIcon className="hidden dark:inline-flex" />
          <div className="sr-only">Change theme</div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <ModeToggle />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
