"use client";

import { Link } from "@/i18n/navigation";
import { formatStarCount } from "@/lib/star-count";
import { Container } from "@director.run/design/components/container";
import { GithubBrand } from "@director.run/design/ui/brands";
import { Button } from "@director.run/design/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@director.run/design/ui/dropdown-menu";
import { Logo } from "@director.run/design/ui/logo";
import {
  ArrowRightIcon,
  BookIcon,
  InboxIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeSwitcher } from "./theme-switcher";
import { ModeToggle } from "./theme-toggle";

interface HeaderProps {
  starCount: number;
}

export function Header({ starCount }: HeaderProps) {
  const t = useTranslations("navigation");
  const formattedStarCount = formatStarCount(starCount);

  return (
    <Container size="xl">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Link
            className="focus-visible flex flex-row items-center gap-x-3 rounded-md"
            href="/"
          >
            <Logo className="size-7" />
            <span className="pb-px font-medium text-lg leading-none">
              Director
            </span>
          </Link>
        </div>

        <div className="group *:focus-visible flex flex-row items-center gap-x-2 *:odd:rounded-full *:hover:opacity-100 *:group-focus-within:opacity-70 *:group-focus-within:focus-visible:opacity-100 *:group-hover:opacity-70 lg:justify-end">
          <div className="hidden h-8 items-center px-1.5 lg:flex">
            <Link
              className="focus-visible font-medium font-mono text-sm leading-none tracking-wide hover:underline hover:decoration-1 hover:underline-offset-2"
              href={t("resources.items.documentation.href")}
            >
              {t("resources.items.documentation.label")}
            </Link>
          </div>
          <div className="mr-2 hidden h-8 items-center px-1.5 lg:flex">
            <Link
              className="focus-visible font-medium font-mono text-sm leading-none tracking-wide hover:underline hover:decoration-1 hover:underline-offset-2"
              href={t("resources.items.changelog.href")}
            >
              {t("resources.items.changelog.label")}
            </Link>
          </div>
          <Button
            asChild
            className="hidden pl-3 text-content-primary text-sm lg:inline-flex [&>svg]:size-5"
            tooltip={t("actions.starOnGithub.tooltip")}
            tooltipProps={{ side: "bottom" }}
            variant="secondary"
          >
            <a href={t("actions.starOnGithub.href")}>
              <GithubBrand />
              {t("actions.starOnGithub.label")}
              <span className="text-content-tertiary">
                {formattedStarCount}
              </span>
            </a>
          </Button>

          <Button asChild className="text-sm">
            <Link href={t("actions.primary.href")}>
              {t("actions.primary.label")} <ArrowRightIcon />
            </Link>
          </Button>

          <ThemeSwitcher className="hidden lg:inline-flex" />
          <MobileMenu starCount={formattedStarCount} />
        </div>
      </div>
    </Container>
  );
}

interface MobileMenuProps {
  starCount: string;
}

function MobileMenu({ starCount }: MobileMenuProps) {
  const t = useTranslations("navigation");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="lg:hidden" variant="tertiary">
          <span className="sr-only">Menu</span>
          <MenuIcon className="!size-5 text-content-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
        onCloseAutoFocus={(event) => event.preventDefault()}
        side="bottom"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("resources.label")}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <a href={t("resources.items.documentation.href")}>
              <BookIcon />
              {t("resources.items.documentation.label")}
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={t("resources.items.changelog.href")}>
              <InboxIcon />
              {t("resources.items.changelog.label")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href={t("actions.starOnGithub.href")}>
              <GithubBrand className="size-4" />
              {t("actions.starOnGithub.label")}
              <DropdownMenuShortcut>{starCount}</DropdownMenuShortcut>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunIcon className="dark:hidden" />
            <MoonIcon className="hidden dark:inline-flex" />
            Change theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-40">
            <ModeToggle />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
