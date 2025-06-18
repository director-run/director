import { Container } from "../ui/container";
import { Logo } from "../ui/logo";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";
import { textVariants } from "../ui/typography";
import { BraveBrand, SafariBrand } from "./connection-brands";

export function ConnectionEmptyState() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center">
      <Container size="xs" className="w-full py-12 lg:py-16">
        <Section className="gap-y-8">
          <Logo className="mx-auto" />
          <SectionHeader className="items-center gap-y-1.5 text-center">
            <SectionTitle>Welcome to Director Studio</SectionTitle>
            <SectionDescription>
              Connecting to Director on localhost:3673…
            </SectionDescription>
          </SectionHeader>

          <div className="flex flex-col gap-y-2">
            <div className="flex flex-col gap-y-4 rounded-xl bg-accent p-4">
              <div className="flex flex-col gap-y-1">
                <h3 className={textVariants({ variant: "h2" })}>
                  Director CLI
                </h3>
                <p
                  className={textVariants({
                    variant: "p",
                    className: "text-fg-subtle",
                  })}
                >
                  Make sure Director is up and running.
                </p>
              </div>
              <pre className="self-start rounded-md border-[0.5px] border-fg/10 bg-fg/10 px-2.5 py-1 text-left font-mono text-sm selection:bg-fg selection:text-bg">
                <code>director serve</code>
              </pre>
            </div>

            <div className="flex flex-col gap-y-4 rounded-xl bg-accent p-4">
              <div className="flex flex-row">
                <SafariBrand className="size-7" />
                <BraveBrand className="size-7" />
              </div>
              <div className="flex flex-col gap-y-1">
                <h3 className={textVariants({ variant: "h2" })}>
                  Using Safari or Brave?
                </h3>
                <p
                  className={textVariants({
                    variant: "p",
                    className: "text-fg-subtle",
                  })}
                >
                  Safari and Brave are currently not supported, but we're
                  working on adding support. Please use Chrome.
                </p>
              </div>
            </div>
          </div>
        </Section>
      </Container>
    </div>
  );
}
