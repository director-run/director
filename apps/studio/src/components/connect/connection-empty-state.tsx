import { Container } from "../ui/container";
import { Logo } from "../ui/logo";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";

export function ConnectionEmptyState() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center">
      <Container size="sm" className="w-full py-12 lg:py-16">
        <Section className="gap-y-8">
          <Logo className="mx-auto" />
          <SectionHeader className="items-center gap-y-1.5 text-center">
            <SectionTitle>Director is awaiting connection…</SectionTitle>
            <SectionDescription>
              Please check that the service is running locally. You can start it
              using the command below.
            </SectionDescription>
          </SectionHeader>
          <pre className="mx-auto rounded-xl bg-accent px-3 py-2 text-left font-mono text-sm selection:bg-fg selection:text-bg">
            <code>npx -y @director.run/cli serve</code>
          </pre>
        </Section>
      </Container>
    </div>
  );
}
