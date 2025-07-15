import { trpc } from "@/trpc/server";
import { Container } from "@director.run/design/components/container";
import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

export async function GlobalLayout({ children }: { children: ReactNode }) {
  const { stargazers } = await trpc.github.getStarCount({
    organization: "director-run",
    repo: "director",
  });

  return (
    <div className="@container/layout flex min-h-dvh flex-col gap-y-24 pt-6 md:pt-12">
      <Header starCount={stargazers} />
      <Container
        className="gap-y-28 last:*:mb-4 md:gap-y-32 md:*:last:mb-12 lg:gap-y-48 lg:*:last:mb-24"
        size="xl"
      >
        {children}
      </Container>
      <Footer starCount={stargazers} />
    </div>
  );
}
