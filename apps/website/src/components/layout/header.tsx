import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/site-config";
import { Button, ButtonLabel } from "../ui/button";

export function Header({ className }: { className?: string }) {
  return (
    <Container
      data-slot="header"
      className={cn(
        "flex flex-row items-center justify-between gap-x-6",
        className,
      )}
      asChild
    >
      <header>
        <div className="flex flex-row items-center gap-x-2">
          <Link
            href="/"
            className="inline-block rounded-lg transition-colors duration-200 hover:text-fg/50"
          >
            <span className="sr-only">Director</span>
            <Logo />
          </Link>
          <span className="font-[450] text-lg leading-6">Director</span>
        </div>

        <nav className="group flex flex-row items-center gap-x-5 leading-5">
          <div className="group flex flex-row items-center gap-x-0 md:transition-all md:duration-300 md:ease-in-out md:*:group-hover:opacity-20 md:*:group-focus-within:opacity-20 md:*:group-focus-within:focus-visible:opacity-100 md:*:hover:opacity-100">
            {siteConfig.navigation.map((it) => {
              const key = `header-${it.label}`;
              return (
                <Button
                  variant={it.variant}
                  className={cn(
                    it.variant !== "ghost" && "ml-2",
                    it.variant === "primary" && "rounded-full",
                    !it.mobile && "hidden md:inline-flex",
                  )}
                  asChild
                  key={key}
                >
                  <a href={it.href}>
                    <ButtonLabel>{it.label}</ButtonLabel>
                  </a>
                </Button>
              );
            })}
          </div>
        </nav>
      </header>
    </Container>
  );
}
