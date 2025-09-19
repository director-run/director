import { Container } from "@director.run/studio/components/ui/container.tsx";
import { Logo } from "@director.run/studio/components/ui/icons/logo.tsx";
import {
  Section,
  SectionHeader,
} from "@director.run/studio/components/ui/section.tsx";
import {
  SectionDescription,
  SectionTitle,
} from "@director.run/studio/components/ui/section.tsx";
import { useState } from "react";
import { LoginForm } from "../components/forms/login-form.tsx";
import { useAuth } from "../contexts/auth-context.tsx";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { login } = useAuth();
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
              defaultValues={{
                email: "barnaby@example.com",
                password: "password",
              }}
              onSubmit={async (user) => {
                console.log("user", user);
                try {
                  await setIsLoading(true);
                  await login(user);
                } catch (error) {
                  await setError(error as Error);
                } finally {
                  await setIsLoading(false);
                }
              }}
              isSubmitting={isLoading}
            />
          </Section>
        </Container>
      </div>
    </>
  );
}
