import { Icon } from "@phosphor-icons/react";
import {
  AppWindowIcon,
  BookOpenIcon,
  DoorOpenIcon,
  FileTextIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  ListIcon,
  LockIcon,
  MagnifyingGlassIcon,
  PlugIcon,
  RocketIcon,
  ShieldCheckIcon,
  XLogoIcon,
} from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Separator } from "@/components/layout/separator";
import { Badge, BadgeLabel } from "@/components/ui/badge";
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
  PatternCardPattern,
  PatternCardTitle,
} from "@/components/ui/pattern-card";
import { cn } from "@/lib/cn";

import heroImage from "../public/images/product-image.png";

const features: {
  title: string;
  description: string;
  icon: Icon;
}[] = [
  {
    title: "Connection hub",
    description:
      "Single endpoint for all clients with multiple backend MCP servers",
    icon: PlugIcon,
  },
  {
    title: "One click clients",
    description: "Install your Director instance with a single click",
    icon: RocketIcon,
  },
  {
    title: "Great discovery",
    description: "Browse and securely install MCP servers from our registry",
    icon: MagnifyingGlassIcon,
  },
  {
    title: "Proxy isolation",
    description: "Prevent cross-contamination with our independent contexts",
    icon: ShieldCheckIcon,
  },
  {
    title: "Audit trails",
    description: "Track all requests and responses to MCP servers",
    icon: FileTextIcon,
  },
  {
    title: "Top notch security",
    description:
      "Secure transports, error isolation, and configurable security settings",
    icon: LockIcon,
  },
];

export default function IndexPage() {
  return (
    <div className="flex min-h-dvh flex-col pt-6 md:pt-10 lg:pt-14">
      <Header />

      <Container
        className="flex grow flex-col gap-y-16 py-20 md:gap-y-24 md:pb-28"
        asChild
      >
        <main>
          <div className="flex flex-col gap-y-8 md:gap-y-10">
            <div className="flex max-w-[56ch] flex-col gap-y-3">
              <h1 className="text-balance font-[450] text-3xl leading-[1.125] md:text-4xl">
                One command to rule all your AI tools.
              </h1>
              <p className="text-pretty text-fg-subtle text-lg leading-snug">
                Director is a modern, open-source API gateway that allows you to
                connect your applications to any service, without the need for
                code.
              </p>

              <div className="flex flex-row gap-2 pt-2 md:pt-3">
                <Link
                  href="https://studio.director.run"
                  className={cn(
                    "text-center",
                    "transition-colors duration-200",
                    "whitespace-pre rounded-lg bg-primary px-3.5 font-[450] text-base text-surface leading-9 md:px-4.5 md:text-lg md:leading-10",
                    "outline-none ring-2 ring-transparent ring-offset-2 ring-offset-bg focus-visible:ring-primary",
                    "hover:bg-primary/70",
                  )}
                >
                  Get started
                </Link>
                <Link
                  href="https://studio.director.run"
                  className={cn(
                    "text-center",
                    "transition-colors duration-200",
                    "whitespace-pre rounded-full bg-accent px-3.5 font-[450] text-base text-fg/80 leading-9 md:px-4.5 md:text-lg md:leading-10",
                    "outline-none ring-2 ring-transparent ring-offset-2 ring-offset-bg focus-visible:ring-primary",
                    "hover:bg-fg/20",
                  )}
                >
                  Read the docs
                </Link>
              </div>
            </div>

            <div className="relative flex flex-col items-center bg-accent/50">
              <Image src={heroImage} alt="Director" />
              <Pattern
                type="dots"
                size={1.25}
                gap={8}
                className="-z-10 absolute top-2 left-2 size-full text-fg/80"
              />
            </div>
          </div>

          <Separator pattern={{ type: "horizontal-lines" }} />

          <div className="[[data-slot=separator]+&]:-mt-2 flex flex-col gap-y-6 sm:gap-y-8 md:gap-y-10">
            <div className="flex max-w-[48ch] flex-col gap-y-2 sm:mx-auto sm:items-center sm:text-center">
              <h2 className="text-balance font-[450] text-2xl leading-tight sm:text-3xl">
                Full of features
              </h2>
              <p className="text-pretty text-base text-fg-subtle leading-snug sm:text-lg">
                Director is a modern, open-source API gateway that allows you to
                connect your applications to any service.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 md:grid-cols-3">
              {features.map((feature, index) => (
                <PatternCard className="md:p-6" key={index}>
                  <PatternCardIcon>
                    <feature.icon weight="fill" />
                  </PatternCardIcon>

                  <PatternCardContent>
                    <PatternCardTitle>{feature.title}</PatternCardTitle>
                    <PatternCardDescription>
                      {feature.description}
                    </PatternCardDescription>
                  </PatternCardContent>
                </PatternCard>
              ))}
            </div>
          </div>

          <Separator pattern={{ type: "crosshatch" }} className="text-fg/10" />

          <div className="[[data-slot=separator]+&]:-mt-2 full-bleed relative bg-gradient-to-b from-bg to-accent/50">
            <Container className="max-w-3xl pb-16 md:pb-24">
              <div className="flex flex-col gap-y-6 sm:gap-y-8 md:gap-y-10">
                <div className="flex max-w-[48ch] flex-col gap-y-2 sm:mx-auto sm:text-center">
                  <h2 className="text-balance font-[450] text-2xl leading-tight sm:text-3xl">
                    Get started in seconds
                  </h2>
                  <p className="text-pretty text-base text-fg-subtle leading-snug sm:text-lg">
                    Director is a modern, open-source API gateway that allows
                    you to connect your applications to any service.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  <Card>
                    <CardHeader>
                      <Badge variant="success" className="mb-2 self-start">
                        <BadgeLabel uppercase>Step 1</BadgeLabel>
                      </Badge>
                      <CardTitle>
                        Install and run the Director CLI locally
                      </CardTitle>
                      <CardDescription>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Quisquam, quos. Elot ipsum dolor sit amet consectetur
                        adipisicing elit. Quisquam, quos.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Install the Director CLI</p>
                      <pre>
                        <code>$ npm install -g @director.run/cli</code>
                      </pre>
                      <p>Run the Director CLI</p>
                      <pre>
                        <code>$ director serve</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Badge variant="success" className="mb-2 self-start">
                        <BadgeLabel uppercase>Step 2</BadgeLabel>
                      </Badge>
                      <CardTitle>Create your first MCP Proxy Server</CardTitle>
                      <CardDescription>
                        A proxy server is a MCP servers that encapsulate any
                        number of other MCP servers.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>
                        Create your first server using the following command:
                      </p>
                      <pre>
                        <code>$ director create my-first-proxy</code>
                      </pre>
                      <p>
                        Let's add the fetch server from the director registry
                      </p>
                      <pre className="whitespace-pre">
                        <code>
                          $ director add fetch --target=my-first-proxy
                        </code>
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Badge variant="success" className="mb-2 self-start">
                        <BadgeLabel uppercase>Step 3</BadgeLabel>
                      </Badge>
                      <CardTitle>Connect an MCP client</CardTitle>
                      <CardDescription>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Quisquam, quos.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre">
                        <code>
                          $ director connect my-first-proxy --target=cursor
                        </code>
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-row justify-center gap-2 pt-3">
                  <Link
                    href="https://studio.director.run"
                    className={cn(
                      "flex flex-row items-center gap-x-2 text-center",
                      "transition-colors duration-200",
                      "whitespace-pre rounded-full bg-primary pr-3.5 pl-3 font-[450] text-base text-primary-fg leading-9 md:pr-4.5 md:pl-3 md:text-lg md:leading-10",
                      "outline-none ring-2 ring-transparent ring-offset-2 ring-offset-accent-subtle focus-visible:ring-primary",
                      "hover:bg-fg/20",
                    )}
                  >
                    <BookOpenIcon weight="fill" />
                    Read the docs
                  </Link>
                </div>
              </div>
            </Container>
            <Pattern
              type="dots"
              size={1.5}
              gap={5}
              className="-z-10 absolute top-3 right-0 left-3 w-[calc(100%-0.75rem)] text-fg/70 md:top-5 md:left-5 md:w-[calc(100%-1.25rem)]"
            />
          </div>

          <div className="flex flex-col gap-y-6 sm:gap-y-8 md:gap-y-10">
            <div className="flex max-w-[48ch] flex-col gap-y-2 sm:mx-auto sm:text-center">
              <h2 className="text-balance font-[450] text-2xl leading-tight sm:text-3xl">
                Proudly open source
              </h2>
              <p className="text-pretty text-base text-fg-subtle leading-snug sm:text-lg">
                Director is a modern, open-source API gateway that allows you to
                connect your applications to any service.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6">
              <PatternCard className="bg-accent/70" asChild>
                <Link href="/">
                  <PatternCardIcon>
                    <DoorOpenIcon weight="fill" />
                  </PatternCardIcon>

                  <PatternCardContent>
                    <PatternCardTitle>Gateway</PatternCardTitle>
                    <PatternCardDescription>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Quisquam, quos.
                    </PatternCardDescription>
                  </PatternCardContent>

                  <PatternCardPattern
                    type="dots"
                    size={1.25}
                    gap={6}
                    className="text-fg/50"
                  />
                </Link>
              </PatternCard>

              <PatternCard className="bg-accent/70" asChild>
                <Link href="/">
                  <PatternCardIcon>
                    <AppWindowIcon weight="fill" />
                  </PatternCardIcon>

                  <PatternCardContent>
                    <PatternCardTitle>Studio</PatternCardTitle>
                    <PatternCardDescription>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Quisquam, quos.
                    </PatternCardDescription>
                  </PatternCardContent>

                  <PatternCardPattern
                    type="dots"
                    size={1.25}
                    gap={6}
                    className="text-fg/50"
                  />
                </Link>
              </PatternCard>

              <PatternCard className="bg-accent/70" asChild>
                <Link href="/">
                  <PatternCardIcon>
                    <ListIcon weight="fill" />
                  </PatternCardIcon>

                  <PatternCardContent>
                    <PatternCardTitle>Registry</PatternCardTitle>
                    <PatternCardDescription>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Quisquam, quos.
                    </PatternCardDescription>
                  </PatternCardContent>

                  <PatternCardPattern
                    type="dots"
                    size={1.25}
                    gap={6}
                    className="text-fg/50"
                  />
                </Link>
              </PatternCard>
            </div>
            <div className="flex flex-row justify-center gap-2 pt-3">
              <Link
                href="https://studio.director.run"
                className={cn(
                  "flex flex-row items-center gap-x-2 text-center",
                  "transition-colors duration-200",
                  "whitespace-pre rounded-full bg-accent pr-3.5 pl-3 font-[450] text-base text-fg/80 leading-9 md:pr-4.5 md:pl-3 md:text-lg md:leading-10",
                  "outline-none ring-2 ring-transparent ring-offset-2 ring-offset-bg focus-visible:ring-primary",
                  "hover:bg-fg/20",
                )}
              >
                <GithubLogoIcon weight="fill" />
                View on GitHub
              </Link>
            </div>
          </div>

          <Separator pattern={{ type: "vertical-lines" }} />

          <div className="[[data-slot=separator]+&]:-mt-2 flex flex-col gap-y-6 sm:gap-y-8 md:gap-y-10">
            <div className="flex max-w-[48ch] flex-col gap-y-2 sm:mx-auto sm:items-center sm:text-center">
              <h2 className="text-balance font-[450] text-2xl leading-tight sm:text-3xl">
                Meet the team
              </h2>
              <p className="text-pretty text-base text-fg-subtle leading-snug sm:text-lg">
                Director is a modern, open-source API gateway that allows you to
                connect your applications to any service.
              </p>
            </div>

            <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <Card className="flex flex-col">
                <CardHeader className="grow">
                  <div className="mb-3 size-12 rounded-full bg-accent" />
                  <CardTitle>Barnaby Malet</CardTitle>
                  <CardDescription>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Quisquam, quos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="group flex flex-row flex-wrap gap-3 py-3 text-fg-subtle sm:py-3">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-none ring-2 ring-transparent ring-offset-2 ring-offset-surface transition-colors duration-200 hover:text-fg focus-visible:ring-primary group-hover:text-fg/25 [&>svg]:size-5"
                  >
                    <GithubLogoIcon weight="fill" />
                    <span className="sr-only">Github</span>
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-none ring-2 ring-transparent ring-offset-2 ring-offset-surface transition-colors duration-200 hover:text-fg focus-visible:ring-primary group-hover:text-fg/25 [&>svg]:size-5"
                  >
                    <LinkedinLogoIcon weight="fill" />
                    <span className="sr-only">Linkedin</span>
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-none ring-2 ring-transparent ring-offset-2 ring-offset-surface transition-colors duration-200 hover:text-fg focus-visible:ring-primary group-hover:text-fg/25 [&>svg]:size-5"
                  >
                    <XLogoIcon weight="fill" />
                    <span className="sr-only">X/Twitter</span>
                  </a>
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardHeader className="grow">
                  <div className="mb-3 size-12 rounded-full bg-accent" />
                  <CardTitle>Tom Bates</CardTitle>
                  <CardDescription>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Quisquam, quos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="group flex flex-row flex-wrap gap-3 py-3 text-fg-subtle sm:py-3">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-none ring-2 ring-transparent ring-offset-2 ring-offset-surface transition-colors duration-200 hover:text-fg focus-visible:ring-primary group-hover:text-fg/25 [&>svg]:size-5"
                  >
                    <GithubLogoIcon weight="fill" />
                    <span className="sr-only">Github</span>
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-none ring-2 ring-transparent ring-offset-2 ring-offset-surface transition-colors duration-200 hover:text-fg focus-visible:ring-primary group-hover:text-fg/25 [&>svg]:size-5"
                  >
                    <LinkedinLogoIcon weight="fill" />
                    <span className="sr-only">Linkedin</span>
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-none ring-2 ring-transparent ring-offset-2 ring-offset-surface transition-colors duration-200 hover:text-fg focus-visible:ring-primary group-hover:text-fg/25 [&>svg]:size-5"
                  >
                    <XLogoIcon weight="fill" />
                    <span className="sr-only">X/Twitter</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </Container>

      <Footer />
    </div>
  );
}
