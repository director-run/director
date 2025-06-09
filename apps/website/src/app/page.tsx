import { ArrowUpRightIcon, GithubLogoIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";

import { CopyCommand } from "@/components/copy-command";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import {
  Section,
  SectionActions,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { Separator } from "@/components/layout/separator";
import { TeamCard } from "@/components/team-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pattern } from "@/components/ui/pattern";
import {
  PatternCard,
  PatternCardContent,
  PatternCardDescription,
  PatternCardIcon,
  PatternCardTitle,
} from "@/components/ui/pattern-card";
import { siteConfig } from "@/site-config";

import { Button, ButtonIcon, ButtonLabel } from "@/components/ui/button";

import heroImageMobile from "./hero-image--mobile.png";
import heroImage from "./hero-image.png";

export default function IndexPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="relative bg-accent text-fg/90">
        <Container className="flex h-10 items-center justify-center">
          <div className="relative z-10 block bg-accent px-2 py-1 text-center font-[500] text-base leading-none tracking-[0.01em]">
            Director is in technical preview
          </div>
        </Container>
        <Pattern
          type="dots"
          size={2}
          gap={10}
          patternOffset={{ x: 3, y: 3 }}
          className="absolute top-0 left-0 size-full text-fg"
        />
      </div>

      <Header className="pt-6 md:pt-10 lg:pt-14" />

      <Container
        className="flex grow flex-col gap-y-16 py-20 md:gap-y-24 md:pb-28"
        asChild
      >
        <main>
          <div className="flex flex-col gap-y-8 md:gap-y-10">
            <div className="flex flex-col gap-y-3">
              <h1 className="max-w-[32ch] text-balance font-[450] text-3xl leading-[1.125] sm:text-4xl md:text-5xl">
                Open source middleware for all your MCP needs.
              </h1>
              <p className="max-w-[54ch] text-pretty text-fg/80 text-lg leading-snug md:text-xl">
                Director is a modern, open-source API gateway that allows you to
                connect your applications to any service, without the need for
                code.
              </p>

              <div className="flex flex-row gap-2 pt-2 md:pt-3">
                <Button size="lg" asChild>
                  <a href="#">
                    <ButtonLabel>Get started</ButtonLabel>
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full"
                  asChild
                >
                  <a href="#">
                    <ButtonLabel>Read the docs</ButtonLabel>
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative flex flex-col items-center rounded-2xl bg-accent">
              <Image
                src={heroImage}
                className="relative z-10 hidden md:block"
                alt="Director"
                priority
              />
              <Image
                src={heroImageMobile}
                className="relative z-10 block max-w-sm md:hidden"
                alt="Director"
                priority
              />
              <Pattern
                type="dots"
                size={2}
                gap={10}
                className="absolute top-3 left-3 z-0 size-full text-fg md:top-5 md:left-5"
              />
            </div>
          </div>

          <Separator pattern={{ type: "horizontal-lines", size: 2, gap: 4 }} />

          <Section>
            <SectionHeader centered>
              <SectionTitle>Full of features</SectionTitle>
              <SectionDescription>
                Director is a modern, open-source API gateway that allows you to
                connect your applications to any service.
              </SectionDescription>
            </SectionHeader>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {siteConfig.features.map((feature, index) => (
                <PatternCard
                  className="flex-1"
                  key={index}
                  pattern={{
                    type: "horizontal-lines",
                    size: 1.5,
                    gap: 4,
                  }}
                >
                  <PatternCardIcon>
                    <feature.icon weight="duotone" />
                  </PatternCardIcon>

                  <PatternCardContent className="gap-y-1">
                    <PatternCardTitle>{feature.title}</PatternCardTitle>
                    <PatternCardDescription>
                      {feature.description}
                    </PatternCardDescription>
                  </PatternCardContent>
                </PatternCard>
              ))}
            </div>
          </Section>

          <div className="group [[data-slot=separator]+&]:-mt-2 full-bleed relative bg-accent">
            <Container className="relative z-10 py-20 md:py-32">
              <Section>
                <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
                  <Card className="transition-transform duration-200 ease-in-out group-focus-within:rotate-0 group-hover:rotate-0 md:rotate-4">
                    <CardHeader>
                      <CardTitle className="md:text-2xl">
                        Run the Quickstart
                      </CardTitle>
                      <CardDescription>
                        Our Quickstart guide walks you through setting up the
                        MCP Gateway, configuring it effortlessly in Studio, and
                        seamlessly connecting to your favorite tools.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CopyCommand command="npx @director.run/cli quickstart" />
                    </CardContent>
                  </Card>
                </div>
              </Section>
            </Container>
            <Pattern
              type="dots"
              size={2}
              gap={10}
              patternOffset={{ x: 1, y: 1 }}
              className="absolute inset-x-0 top-3 z-0 text-fg/80 md:top-5"
            />
          </div>

          <Section>
            <SectionHeader centered>
              <SectionTitle>Proudly open source</SectionTitle>
              <SectionDescription>
                We&apos;re making Director completely open source so you can see
                exactly how it works under the hood.
              </SectionDescription>
            </SectionHeader>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
              {siteConfig.repos.map((it) => (
                <PatternCard
                  key={it.title}
                  pattern={{
                    type: "dots",
                    size: 2,
                    gap: 4,
                  }}
                  asChild
                >
                  <a href={it.href}>
                    <PatternCardIcon>
                      <it.icon weight="duotone" />
                    </PatternCardIcon>

                    <PatternCardContent>
                      <PatternCardTitle className="flex flex-row items-center gap-x-1 text-xl">
                        {it.title}{" "}
                        <ArrowUpRightIcon
                          aria-hidden
                          className="size-5 text-primary opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100"
                          weight="bold"
                        />
                      </PatternCardTitle>
                      <PatternCardDescription className="text-base">
                        {it.description}
                      </PatternCardDescription>
                    </PatternCardContent>
                  </a>
                </PatternCard>
              ))}
            </div>

            <SectionActions>
              <Button
                variant="secondary"
                className="rounded-full"
                size="lg"
                asChild
              >
                <a
                  href={
                    siteConfig.profiles.filter((it) => it.type === "github")[0]
                      .url
                  }
                >
                  <ButtonIcon>
                    <GithubLogoIcon weight="fill" />
                  </ButtonIcon>
                  <ButtonLabel>View on GitHub</ButtonLabel>
                </a>
              </Button>
            </SectionActions>
          </Section>

          <Separator
            pattern={{
              type: "crosshatch",
              size: 2,
              gap: 4,
            }}
            className="h-2.5 py-px"
          />

          <Section>
            <SectionHeader centered>
              <SectionTitle>Meet the team</SectionTitle>
              <SectionDescription>
                Director is a modern, open-source API gateway that allows you to
                connect your applications to any service.
              </SectionDescription>
            </SectionHeader>

            <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {siteConfig.members
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((it) => (
                  <TeamCard key={it.name} {...it} />
                ))}
            </div>
          </Section>
        </main>
      </Container>

      <Footer />
    </div>
  );
}
