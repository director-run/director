"use client"; // Error boundaries must be Client Components
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { SectionDescription, SectionTitle } from "@/components/ui/section";
import { Section, SectionHeader } from "@/components/ui/section";
import { TRPCClientError } from "@trpc/client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const errorMessage = error.message;
  const errorData = error instanceof TRPCClientError ? error.data : undefined;

  return (
    <div className="flex min-h-dvh w-full items-center justify-center">
      <Container size="sm" className="w-full py-12 lg:py-16">
        <Section className="gap-y-8">
          <Logo className="mx-auto" />
          <SectionHeader className="items-center gap-y-1.5 text-center">
            <SectionTitle className="font-medium text-2xl">
              Something went wrong!
            </SectionTitle>
            <SectionDescription className="text-base">
              {errorMessage}
            </SectionDescription>
          </SectionHeader>
          {errorData && (
            <pre className="max-h-[300px] w-full overflow-y-auto rounded-xl bg-accent p-4 text-left font-mono text-sm">
              <code>{JSON.stringify(errorData, null, 2)}</code>
            </pre>
          )}
        </Section>
      </Container>
    </div>
  );
}
