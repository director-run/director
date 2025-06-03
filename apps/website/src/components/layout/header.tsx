import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

export function Header() {
  return (
    <Container
      className="flex flex-row items-center justify-between gap-x-6"
      asChild
    >
      <header>
        <div className="flex flex-row items-center gap-x-2">
          <Link
            href="/"
            className={cn(
              "inline-block outline-none transition-colors duration-200 hover:text-fg/50",
              "rounded-lg outline-none ring-2 ring-transparent ring-offset-2 ring-offset-bg focus-visible:ring-primary",
            )}
          >
            <span className="sr-only">Director</span>
            <Logo />
          </Link>
          <span className="font-medium text-lg leading-6">director.run</span>
          <span className="select-none rounded-sm bg-accent px-1 font-[550] font-mono text-[9px] text-fg-subtle uppercase leading-4 tracking-widest">
            Preview
          </span>
        </div>

        <nav className="group hidden flex-row items-center gap-x-5 text-sm leading-5 md:flex">
          <Link
            className="font-[450] outline-none transition-[colors,_opacity] duration-200 hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-30 group-hover:opacity-30"
            href="https://github.com/theworkingcompany/director"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </Link>

          <div className="flex flex-row gap-x-2">
            <Link
              href="https://studio.director.run"
              className={cn(
                "font-[450] transition-[colors,_opacity] duration-200",
                "whitespace-pre rounded-full bg-accent px-3 text-fg leading-7",
                "outline-none ring-2 ring-transparent ring-offset-2 ring-offset-bg focus-visible:ring-primary",
                "hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-30 group-hover:opacity-30",
              )}
            >
              Documentation
            </Link>

            <Link
              href="https://studio.director.run"
              className={cn(
                "font-[450] transition-[colors,_opacity] duration-200",
                "whitespace-pre rounded bg-primary px-2.5 text-primary-fg leading-7",
                "outline-none ring-2 ring-transparent ring-offset-2 ring-offset-bg focus-visible:ring-primary",
                "hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-30 group-hover:opacity-30",
              )}
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>
    </Container>
  );
}
