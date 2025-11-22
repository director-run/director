import type { ReactNode } from "react";
import { Container } from "../../ui/container.tsx";
import { Logo } from "../../ui/icons/logo.tsx";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../../ui/section.tsx";

export function WaitlistPage(props: Props) {
  const { email, logoutLink } = props;
  return (
    <>
      <div className="flex min-h-dvh w-full items-center justify-center">
        <Container size="sm" className="w-full py-12 lg:py-16">
          <Section className="gap-y-8">
            <Logo className="mx-auto" />
            <SectionHeader className="items-center gap-y-1.5 text-center">
              <SectionTitle className="font-medium text-2xl">
                You're on the waitlist
              </SectionTitle>
              <SectionDescription className="text-base">
                Thanks for signing up! Your account is pending activation. We'll
                be in touch soon.
              </SectionDescription>
            </SectionHeader>
            {email && (
              <p className="text-center text-fg-subtle text-sm">
                Signed up as {email}
              </p>
            )}
            {logoutLink && <div className="text-center">{logoutLink}</div>}
          </Section>
        </Container>
      </div>
    </>
  );
}

type Props = {
  email?: string;
  logoutLink?: ReactNode;
};
