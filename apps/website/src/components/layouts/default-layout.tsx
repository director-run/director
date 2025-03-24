"use client";

import { Logo } from "@director/ui/components/brand";
import { cn } from "@director/ui/lib/cn";
import { Button } from "@director/ui/primitives/button";
import { Circle, Star } from "@phosphor-icons/react";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import * as React from "react";
import { ModeToggle } from "../theme-toggle";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-device w-full max-w-7xl flex-col justify-between gap-y-16 p-4 sm:p-6 md:p-8">
      {children}
    </main>
  );
}

export function DefaultLayoutHeader({
  className,
  ...props
}: Omit<React.ComponentProps<"header">, "children">) {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between gap-x-4",
        className,
      )}
      {...props}
    >
      <Link href="/">
        <Logo />
      </Link>

      <nav className="flex items-center gap-x-1.5">
        <Button label="Star on Github" variant="secondary" asChild>
          <Link href="/">
            <Star weight="fill" />
            2.3k
          </Link>
        </Button>

        <Button variant="default" asChild>
          <Link href="/">Download for OSX</Link>
        </Button>
      </nav>
    </header>
  );
}

export function DefaultLayoutContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-1 flex-col gap-y-16", className)} {...props}>
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
    <footer
      className={cn(
        "flex w-full flex-col gap-y-16",
        // "border-gray-3 border-t pt-10",
        className,
      )}
      {...props}
    >
      {hasSections && (
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
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
                      item.href.endsWith(".dmg") || item.href.endsWith(".zip");

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
                              : "underline decoration-gray-8 underline-offset-2 hover:decoration-gray-12",
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

        <div className="flex gap-x-2">
          <Button variant="ghost" className="gap-x-2" asChild>
            <Link href="/">
              <Circle weight="fill" className="size-2" />
              All systems normal
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
}
