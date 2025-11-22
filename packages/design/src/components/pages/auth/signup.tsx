import type { ReactNode } from "react";
import { SignupForm } from "../../forms/signup-form.tsx";
import { Container } from "../../ui/container.tsx";
import { Logo } from "../../ui/icons/logo.tsx";
import { Section, SectionHeader } from "../../ui/section.tsx";
import { SectionDescription, SectionTitle } from "../../ui/section.tsx";

export function SignupPage(props: Props) {
  const { error, isLoading, defaultValues, onSubmit, loginLink } = props;
  return (
    <>
      <div className="flex min-h-dvh w-full items-center justify-center">
        <Container size="sm" className="w-full py-12 lg:py-16">
          <Section className="gap-y-8">
            <Logo className="mx-auto" />
            <SectionHeader className="items-center gap-y-1.5 text-center">
              <SectionTitle className="font-medium text-2xl">
                Create an account
              </SectionTitle>
              <SectionDescription className="text-base">
                Enter your email and password to get started
              </SectionDescription>
            </SectionHeader>
            {error && (
              <div style={{ color: "red" }}>ERROR: {error.message}</div>
            )}
            <SignupForm
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              isSubmitting={isLoading}
            />
            {loginLink && (
              <p className="text-center text-fg-subtle text-sm">
                Already have an account? {loginLink}
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
  defaultValues?: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  onSubmit: (user: { email: string; password: string }) => Promise<void> | void;
  loginLink?: ReactNode;
};
