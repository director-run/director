import {
  Container,
  FullBleed,
} from "@director.run/design/components/container";
import { Badge, BadgeLabel } from "@director.run/design/ui/badge";
import { GithubBrand, XBrand } from "@director.run/design/ui/brands";
import { Button } from "@director.run/design/ui/button";
import { Logo } from "@director.run/design/ui/logo";
import { Pattern } from "@director.run/design/ui/pattern";
import { ArrowRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "../i18n/navigation";
import { formatStarCount } from "../lib/star-count";

interface FooterProps {
  starCount: number;
}

export async function Footer({ starCount }: FooterProps) {
  const t = await getTranslations("navigation");

  const formattedStarCount = formatStarCount(starCount);

  return (
    <FullBleed className="relative mt-auto bg-surface py-16">
      <Container className="relative z-10" size="xl">
        <div className="flex flex-col items-center gap-y-16 sm:grid sm:grid-cols-2 sm:items-start md:grid-cols-1">
          <div className="flex flex-col items-center gap-y-6 sm:items-start md:flex-row md:justify-between md:gap-x-6">
            <Link
              className="focus-visible flex flex-row items-center gap-x-3 rounded-md"
              href="/"
            >
              <Logo className="size-7" />
              <span className="bg-surface pb-px font-medium text-lg leading-none">
                Director
              </span>
            </Link>

            <div className="flex flex-row gap-x-2">
              <Button
                asChild
                className="rounded-full pl-3 text-content-primary text-sm [&>svg]:size-5"
                tooltip={t("actions.starOnGithub.tooltip")}
                tooltipProps={{ side: "top" }}
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
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-y-12 sm:items-start md:row-start-1 md:w-full md:flex-row">
            <div className="flex flex-col items-center gap-y-5 sm:items-start md:flex-1">
              <Badge asChild size="sm" variant="inverse">
                <h3>
                  <BadgeLabel uppercase>{t("products.label")}</BadgeLabel>
                </h3>
              </Badge>

              <ul className="flex flex-col items-center gap-y-3 sm:items-start">
                <li>
                  <Link
                    className="focus-visible flex flex-row items-center gap-x-2 bg-surface font-medium font-mono text-sm leading-none tracking-wide duration-200 ease-in-out hover:opacity-60 [&>svg]:size-4"
                    href={t("products.items.director.href")}
                  >
                    {t("products.items.director.label")}
                  </Link>
                </li>
                <li>
                  <Link
                    className="focus-visible flex flex-row items-center gap-x-2 bg-surface font-medium font-mono text-sm leading-none tracking-wide duration-200 ease-in-out hover:opacity-60 [&>svg]:size-4"
                    href={t("products.items.registry.href")}
                  >
                    {t("products.items.registry.label")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center gap-y-5 sm:items-start md:flex-1">
              <Badge asChild size="sm" variant="inverse">
                <h3>
                  <BadgeLabel uppercase>{t("resources.label")}</BadgeLabel>
                </h3>
              </Badge>

              <ul className="flex flex-col items-center gap-y-3 sm:items-start">
                <li>
                  <Link
                    className="focus-visible flex flex-row items-center gap-x-2 bg-surface font-medium font-mono text-sm leading-none tracking-wide duration-200 ease-in-out hover:opacity-60 [&>svg]:size-4"
                    href={t("resources.items.documentation.href")}
                  >
                    {t("resources.items.documentation.label")}
                  </Link>
                </li>
                <li>
                  <Link
                    className="focus-visible flex flex-row items-center gap-x-2 bg-surface font-medium font-mono text-sm leading-none tracking-wide duration-200 ease-in-out hover:opacity-60 [&>svg]:size-4"
                    href={t("resources.items.changelog.href")}
                  >
                    {t("resources.items.changelog.label")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center gap-y-5 sm:items-start md:flex-1">
              <Badge asChild size="sm" variant="inverse">
                <h3>
                  <BadgeLabel uppercase>{t("social.label")}</BadgeLabel>
                </h3>
              </Badge>

              <ul className="flex flex-col items-center gap-y-3 sm:items-start">
                <li>
                  <a
                    className="focus-visible flex flex-row items-center gap-x-2 bg-surface font-medium font-mono text-sm leading-none tracking-wide duration-200 ease-in-out hover:opacity-60 [&>svg]:size-4"
                    href={t("social.items.github.href")}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <GithubBrand />
                    {t("social.items.github.title")}
                  </a>
                </li>
                <li>
                  <a
                    className="focus-visible flex flex-row items-center gap-x-2 bg-surface font-medium font-mono text-sm leading-none tracking-wide duration-200 ease-in-out hover:opacity-60 [&>svg]:size-4"
                    href={t("social.items.x.href")}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <XBrand />
                    {t("social.items.x.title")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <Pattern
        className="pointer-events-none absolute inset-0 z-0 text-content-tertiary/80 dark:text-content-tertiary/50"
        gap={6}
        patternOffset={{ x: 0, y: 7 }}
        size={1.5}
        type="dots"
      />
    </FullBleed>
  );
}
