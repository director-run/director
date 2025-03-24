import { Container } from "@/components/container";
import { ModeToggle } from "@/components/theme-toggle";
import { trpc } from "@/trpc/server";
import { Logo } from "@director/ui/components/brand";
import { cn } from "@director/ui/lib/cn";
import { Button } from "@director/ui/primitives/button";
import { ArrowDown, ArrowUpRight, Star } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import * as React from "react";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-device flex-col justify-between gap-y-12 py-4 sm:py-6 md:py-8">
      {children}
    </main>
  );
}

export async function DefaultLayoutHeader({
  className,
  ...props
}: Omit<React.ComponentProps<"header">, "children">) {
  const [dmg, stars] = await Promise.all([
    trpc.github.dmg(),
    trpc.github.stars(),
  ]);

  return (
    <Container asChild>
      <header {...props}>
        <div
          className={cn(
            "flex w-full items-center justify-between gap-x-4",
            className,
          )}
        >
          <Link
            className="flex items-center gap-x-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            href="/"
          >
            <Logo />
            <span className="font-semibold text-base uppercase tracking-wide dark:font-normal">
              Director.run
            </span>
          </Link>

          <nav className="flex items-center gap-x-1.5">
            <Button label="Star on Github" variant="secondary" asChild>
              <Link
                href="https://github.com/theworkingcompany/director"
                rel="noopener noreferrer"
              >
                <Star weight="fill" />
                {stars.stars}
              </Link>
            </Button>

            {dmg.dmg && (
              <Button variant="default" asChild>
                <Link href={dmg.dmg}>Download for OSX</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
    </Container>
  );
}

export function DefaultLayoutContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-1 flex-col", className)} {...props}>
      {children}
    </div>
  );
}

interface DefaultLayoutFooterProps
  extends Omit<React.ComponentProps<"footer">, "children"> {
  sections?: {
    title: string;
    items: {
      label: string;
      href: string;
      disabled?: boolean;
    }[];
  }[];
}

export function DefaultLayoutFooter({
  className,
  sections,
  ...props
}: DefaultLayoutFooterProps) {
  const hasSections = sections && sections.length > 0;
  const year = new Date().getFullYear();

  return (
    <Container className="gap-y-16" asChild>
      <footer {...props}>
        {hasSections && (
          <div
            className={cn("grid gap-10", {
              "grid-cols-2": sections.length === 2,
              "grid-cols-2 md:grid-cols-3": sections.length === 3,
              "grid-cols-2 md:grid-cols-4": sections.length === 4,
            })}
          >
            {sections.map((section) => {
              return (
                <div key={section.title} className="flex flex-col gap-y-5">
                  <h3 className="font-semibold text-xs uppercase tracking-widest before:mr-2 before:text-gray-8 before:content-['##'] dark:font-normal">
                    {section.title}
                  </h3>

                  <ul className="flex flex-col gap-y-1 font-light leading-6 dark:font-extralight">
                    {section.items.map((item) => {
                      const isExternal =
                        item.href.startsWith("http") ||
                        item.href.startsWith("mailto:");
                      const isDownload =
                        item.href.endsWith(".dmg") ||
                        item.href.endsWith(".zip");

                      const Comp = item.disabled
                        ? "span"
                        : isExternal
                          ? "a"
                          : Link;

                      const Icon = (() => {
                        if (item.disabled) {
                          return null;
                        }

                        if (isDownload) {
                          return (
                            <ArrowDown
                              className="shrink-0 text-gray-9"
                              aria-hidden
                            />
                          );
                        }

                        if (isExternal) {
                          return (
                            <ArrowUpRight
                              className="shrink-0 text-gray-9"
                              aria-hidden
                            />
                          );
                        }

                        return null;
                      })();

                      return (
                        <li
                          key={item.label}
                          className="flex items-center gap-x-1 whitespace-pre"
                        >
                          <Comp
                            className={cn(
                              item.disabled
                                ? "pointer-events-none text-gray-8"
                                : "cursor-pointer underline decoration-gray-8 underline-offset-2 hover:decoration-gray-12",
                            )}
                            href={item.href}
                            data-disabled={item.disabled}
                            data-slot="footer-link"
                          >
                            {item.label}
                          </Comp>
                          {Icon}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-0 font-light text-gray-10 text-sm leading-6">
            director.run, {year}
          </div>

          <ModeToggle />
        </div>
      </footer>
    </Container>
  );
}
