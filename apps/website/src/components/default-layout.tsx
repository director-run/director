"use client";

import { Slot } from "@radix-ui/react-slot";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { cn } from "@/lib/cn";
import { ConnectButton } from "./connect/connect-button";
import { useConnectContext } from "./connect/connect-context";
import { ConnectDialog, useConnectDialog } from "./connect/connect-dialog";
import { Button } from "./ui/button";
import { SimpleLogo } from "./ui/logo";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  const dialogProps = useConnectDialog();

  return (
    <>
      <div className="flex min-h-dvh w-full flex-col gap-y-0 p-2">
        {children}
      </div>
      <ConnectDialog {...dialogProps} />
    </>
  );
}

export function DefaultLayoutHeader() {
  const { status } = useConnectContext();
  const router = useRouter();

  const isConnected = status === "ready";

  useHotkeys("i", () => router.push("/"), {
    ignoreModifiers: true,
    enableOnFormTags: false,
    enabled: !isConnected,
  });

  useHotkeys("s", () => router.push("/search"), {
    ignoreModifiers: true,
    enableOnFormTags: false,
  });

  useHotkeys(
    "g",
    () => {
      window.open("https://github.com/theworkingcompany/director", "_blank");
    },
    {
      ignoreModifiers: true,
      enableOnFormTags: false,
    },
  );

  return (
    <header className="flex justify-between gap-x-0.5">
      <nav className="flex w-full flex-row gap-x-0.5">
        <Link href="/">
          <SimpleLogo className="size-7 hover:text-primary-hover" />
        </Link>

        <Button asChild>
          <Link href="/">
            <span className="opacity-70">[i]</span>
            <span>Install</span>
          </Link>
        </Button>

        <Button asChild>
          <a
            href="https://github.com/theworkingcompany/director"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="opacity-70">[g]</span>
            <span>Github</span>
          </a>
        </Button>

        <Button asChild>
          <Link href="/search">
            <span className="opacity-70">[s]</span>
            <span>Servers</span>
          </Link>
        </Button>

        <ConnectButton />
      </nav>
    </header>
  );
}

export function DefaultLayoutContent({
  children,
  className,
  ...props
}: ComponentProps<"main">) {
  return (
    <main className={cn("flex w-full grow flex-col", className)} {...props}>
      {children}
    </main>
  );
}

interface FooterItemProps extends ComponentProps<"span"> {
  asChild?: boolean;
}

function FooterItem({
  asChild,
  className,
  children,
  ...props
}: FooterItemProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      className={cn(
        "underline decoration-1 decoration-transparent underline-offset-2 transition-colors duration-200 ease-in-out hover:text-foreground hover:decoration-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function DefaultLayoutFooter({
  className,
  ...props
}: ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "flex cursor-pointer flex-col-reverse justify-between gap-4 px-4 pt-5 pb-3 font-mono text-foreground-subtle text-xs uppercase leading-none tracking-wide sm:flex-row",
        className,
      )}
      {...props}
    >
      <div>&copy; 2025 director.run</div>
      <div className="flex flex-row gap-x-4">
        <FooterItem asChild>
          <Link href="/">Install</Link>
        </FooterItem>
        <FooterItem asChild>
          <a
            href="https://github.com/theworkingcompany/director"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </FooterItem>
        <FooterItem asChild>
          <a
            href="https://x.com/theworkingco"
            rel="noopener noreferrer"
            target="_blank"
          >
            Twitter / X
          </a>
        </FooterItem>
      </div>
    </footer>
  );
}
