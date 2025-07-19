"use client";

import { Container } from "@director.run/design/components/container";
import { Button } from "@director.run/design/ui/button";
import { Logo } from "@director.run/design/ui/logo";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "../i18n/navigation";
import { ThemeSwitcher } from "./theme-switcher";

export function Header() {
  const t = useTranslations("navigation");

  return (
    <Container size="xl" className="shrink-0">
      {/* grid-rows-[36px_auto] md:grid-cols-3 */}
      <div className="grid grid-cols-2 items-center gap-y-4 sm:grid-cols-[auto_1fr] sm:grid-rows-1 sm:gap-x-4">
        <div className="col-span-1 row-start-1 flex items-center">
          <Link
            className="focus-visible inline-flex flex-row items-center gap-x-3 rounded-md"
            href="/"
          >
            <Logo className="size-7" />
            <span className="font-[450] text-[17px] leading-none">
              <span className="hidden text-[17px] text-content-secondary leading-none md:inline">
                Director /{" "}
              </span>
              Registry
            </span>
          </Link>
        </div>

        {/* <div className="col-span-2 row-start-2 flex justify-center sm:col-span-1 sm:row-start-1">
          <Input
            className="rounded-full pl-9"
            wrapperClassName="w-full sm:max-w-sm"
            placeholder="Find a MCP server"
          >
            <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4" />
          </Input>
        </div> */}

        <div className="group *:focus-visible flex flex-row items-center justify-end gap-x-1.5 *:odd:rounded-full *:hover:opacity-100 *:group-focus-within:opacity-70 *:group-focus-within:focus-visible:opacity-100 *:group-hover:opacity-70">
          <Button asChild>
            <Link href={t("actions.primary.href")}>
              {t("actions.primary.label")} <ArrowRightIcon />
            </Link>
          </Button>

          <ThemeSwitcher />
        </div>
      </div>
    </Container>
  );
}
