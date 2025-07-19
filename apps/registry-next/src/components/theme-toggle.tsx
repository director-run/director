"use client";

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@director.run/design/ui/dropdown-menu";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenuRadioGroup onValueChange={setTheme} value={theme}>
      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}
