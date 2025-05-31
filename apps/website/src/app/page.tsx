"use client";

import { Slot } from "@radix-ui/react-slot";
import Link from "next/link";
import { ComponentProps, useId } from "react";

import { Logo } from "@/components/logo";
import { Pattern } from "@/components/pattern";
import { cn } from "@/lib/cn";
import { PlugIcon } from "@phosphor-icons/react";

interface ContainerProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

function Container({ asChild, className, ...props }: ContainerProps) {
  const Component = asChild ? Slot : "div";
  return (
    <Component
      className={cn("mx-auto w-full max-w-5xl px-5 md:px-20", className)}
      {...props}
    />
  );
}

export default function IndexPage() {
  const id = useId();
  return (
    <div className="flex min-h-dvh flex-col pt-6 md:pt-10 lg:pt-14">
      <Container
        className="flex flex-row items-center justify-between gap-x-6"
        asChild
      >
        <header>
          <div className="flex flex-row items-center gap-x-2">
            <Link
              href="/"
              className="inline-block outline-none transition-colors duration-200 hover:text-fg/50"
            >
              <span className="sr-only">Director</span>
              <Logo />
            </Link>
            <span className="hidden font-medium text-lg leading-6 md:block">
              director.run
            </span>
            <span className="select-none rounded-sm bg-accent px-1 font-[550] font-mono text-[9px] text-fg-subtle uppercase leading-4 tracking-widest">
              Preview
            </span>
          </div>

          <nav className="group flex flex-row items-center gap-x-5 text-sm leading-5">
            <Link
              className="font-[450] transition-colors duration-200 hover:text-fg group-hover:text-fg/50"
              href="/updates"
            >
              Updates
            </Link>
            <Link
              className="font-[450] transition-colors duration-200 hover:text-fg group-hover:text-fg/50"
              href="https://docs.director.run"
            >
              Documentation
            </Link>
            <Link
              className="font-[450] transition-colors duration-200 hover:text-fg group-hover:text-fg/50"
              href="https://github.com/director-run/director"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github{" "}
              <span className="font-normal text-fg/70">(3,218 stars)</span>
            </Link>
          </nav>
        </header>
      </Container>

      <Container
        className="flex grow flex-col gap-y-16 py-20 md:gap-y-24"
        asChild
      >
        <main>
          <div className="flex flex-col gap-y-5 md:gap-y-8">
            <div className="flex max-w-[56ch] flex-col gap-y-3">
              <h1 className="text-balance font-normal text-3xl leading-tight md:text-4xl">
                One command to rule all your AI tools.
              </h1>
              <p className="text-pretty text-fg-subtle text-lg leading-snug">
                Director is a modern, open-source API gateway that allows you to
                connect your applications to any service, without the need for
                code.
              </p>
            </div>

            <div className="relative bg-accent/90">
              <pre className="w-full overflow-hidden p-6 font-mono text-sm leading-6">
                <code className="relative whitespace-pre">
                  {`# install director
$ npm install -g @working.dev/director

# start the service
$ director run

# create a new proxy server
$ director studio`}
                </code>
              </pre>
              <Pattern
                type="dots"
                className="-z-10 absolute top-2 left-1.5 size-full text-fg/50 md:top-2 md:left-2.5"
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-6 sm:gap-y-8 md:gap-y-10">
            <div className="flex max-w-[48ch] flex-col gap-y-2 sm:mx-auto sm:items-center sm:text-center">
              <h2 className="text-balance font-normal text-2xl leading-tight">
                Full of features
              </h2>
              <p className="text-pretty text-base text-fg-subtle leading-snug sm:text-lg">
                Director is a modern, open-source API gateway that allows you to
                connect your applications to any service.
              </p>
            </div>
            <div className="relative grid grid-cols-2 border-fg/20 border-t-[0.5px] border-l-[0.5px] md:grid-cols-3">
              {new Array(6).fill(0).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-between gap-y-6 border-fg/20 border-r-[0.5px] border-b-[0.5px] p-4"
                >
                  <PlugIcon weight="fill" className="size-6 text-fg-subtle" />

                  <div className="flex flex-col gap-y-1">
                    <h3 className="text-balance font-normal text-base sm:text-lg leading-tight">
                      Feature {index + 1}
                    </h3>
                    <p className="text-pretty text-fg-subtle text-xs leading-snug">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Quisquam, quos.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </Container>

      <footer className="relative">
        <Container className="py-16 md:py-24">
          <div className="flex flex-col items-center gap-4">
            <Logo className="size-12" />
            <div className="flex flex-col items-center gap-1">
              <span className="bg-bg/50 font-medium text-xl leading-6">
                director.run
              </span>
              <span className="bg-bg/50 font-normal text-base text-fg/90 leading-5">
                Made with Ritalin
              </span>
            </div>
          </div>
        </Container>

        <Pattern
          type="dots"
          className="-z-10 pointer-events-none absolute inset-0 text-fg/30"
        />
      </footer>
    </div>
  );
}
