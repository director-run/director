import type { ReactNode } from "react";
import { LoginForm } from "../../forms/login-form.tsx";
import { Container } from "../../ui/container.tsx";
import { Logo } from "../../ui/icons/logo.tsx";
import { Section, SectionHeader } from "../../ui/section.tsx";
import { SectionDescription, SectionTitle } from "../../ui/section.tsx";

export function LoginPage(props: Props) {
  const { error, isLoading, defaultValues, onSubmit, signupLink } = props;
  return (
    <>
      <div className="flex min-h-dvh w-full items-center justify-center">
        <Container size="sm" className="w-full py-12 lg:py-16">
          <Section className="gap-y-8">
            <Logo className="mx-auto" />
            <SectionHeader className="items-center gap-y-1.5 text-center">
              <SectionTitle className="font-medium text-2xl">
                Welcome to Director
              </SectionTitle>
              <SectionDescription className="text-base">
                Please log in to continue
              </SectionDescription>
            </SectionHeader>
            {error && (
              <div style={{ color: "red" }}>ERROR: {error.message}</div>
            )}
            <LoginForm
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              isSubmitting={isLoading}
            />
            {signupLink && (
              <p className="text-center text-fg-subtle text-sm">
                Don't have an account? {signupLink}
              </p>
            )}
          </Section>
        </Container>
      </div>
    </>
  );
}

type Props = {
  error: Error | null;
  isLoading: boolean;
  defaultValues: {
    email: string;
    password: string;
  };
  onSubmit: (user: { email: string; password: string }) => Promise<void> | void;
  signupLink?: ReactNode;
};
