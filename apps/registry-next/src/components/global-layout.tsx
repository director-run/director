import {
  Shell,
  ShellBreadcrumb,
  ShellBreadcrumbAction,
  ShellBreadcrumbList,
  ShellBreadcrumbSeparator,
  ShellContent,
  ShellHeader,
} from "@director.run/design/components/shell";
import { GithubBrand } from "@director.run/design/ui/brands";
import { Button } from "@director.run/design/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@director.run/design/ui/dropdown-menu";
import { Logo } from "@director.run/design/ui/logo";
import { Link } from "i18n/navigation";
import { BookOpenTextIcon, MoreVerticalIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ModeToggle } from "./theme-toggle";

interface GlobalLayoutProps {
  children: ReactNode;
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  return (
    <Shell>
      <ShellHeader>
        <div className="grid size-7 place-items-center">
          <Logo className="size-4.5" />
        </div>

        <ShellBreadcrumb>
          <ShellBreadcrumbList>
            <ShellBreadcrumbAction asChild>
              <Link href="/">Registry</Link>
            </ShellBreadcrumbAction>
            <ShellBreadcrumbSeparator />
            <ShellBreadcrumbAction asChild>
              <Link href="/">Thing</Link>
            </ShellBreadcrumbAction>
          </ShellBreadcrumbList>
        </ShellBreadcrumb>

        <div className="flex flex-row items-center gap-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="tertiary">
                <MoreVerticalIcon />
                <div className="sr-only">More</div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" side="bottom">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Resources</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <a href="https://docs.director.run">
                    <BookOpenTextIcon />
                    Documentation
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://github.com/director-run/director"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubBrand className="size-4" />
                    Github
                  </a>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <ModeToggle />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ShellHeader>
      <ShellContent>{children}</ShellContent>
    </Shell>
  );
}
