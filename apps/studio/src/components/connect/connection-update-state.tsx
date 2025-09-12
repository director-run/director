import { Container } from "../ui/container";
import { Logo } from "../ui/icons/logo";
import { SimpleMarkdown } from "../ui/markdown";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";
import { textVariants } from "../ui/typography";
import {} from "./connection-brands";

export function ConnectionUpdateState({
  cliVersion,
  studioVersion,
}: {
  cliVersion: string | null;
  studioVersion: string | null;
}) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center">
      <Container size="xs" className="w-full py-12 lg:py-16">
        <Section className="gap-y-8">
          <Logo className="mx-auto" />
          <SectionHeader className="items-center gap-y-1.5 text-center">
            <SectionTitle>New version available</SectionTitle>
            <SectionDescription>
              <SimpleMarkdown>{`You’re running \`v${cliVersion}\` of the Director CLI, but \`v${studioVersion}\` is the latest version.`}</SimpleMarkdown>
            </SectionDescription>
          </SectionHeader>

          <div className="flex flex-col gap-y-2">
            <div className="flex flex-col gap-y-4 rounded-xl bg-accent p-4">
              <div className="flex flex-col gap-y-1">
                <h3 className={textVariants({ variant: "h2" })}>
                  To continue using Studio, please update your CLI.
                </h3>
                <p
                  className={textVariants({
                    variant: "p",
                    className: "text-fg-subtle",
                  })}
                >
                  Run the following command to update your CLI.
                </p>
              </div>
              <pre className="self-start rounded-md border-[0.5px] border-fg/10 bg-fg/10 px-2.5 py-1 text-left font-mono text-sm selection:bg-fg selection:text-bg">
                <code>npm install -g @director.run/cli@latest</code>
              </pre>
            </div>
          </div>
        </Section>
      </Container>
    </div>
  );
}
