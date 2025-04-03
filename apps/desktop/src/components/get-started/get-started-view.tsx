import { Container } from "@/components/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/section";
import { ServerForm } from "@/components/servers/server-form";

export function GetStartedView() {
  return (
    <div className="flex grow flex-col items-center justify-center">
      <Container size="sm">
        <div className="flex flex-col gap-y-20">
          <Section name="Get started">
            <SectionHeader>
              <SectionTitle>Get started with Director</SectionTitle>
              <SectionDescription>
                Let&apos;s get your first proxy server up and running.
              </SectionDescription>
            </SectionHeader>
            <SectionSeparator />
            <ServerForm />
          </Section>
        </div>
      </Container>
    </div>
  );
}
