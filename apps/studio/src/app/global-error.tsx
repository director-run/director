"use client"; // Error boundaries must be Client Components
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { TRPCClientError } from "@trpc/client";

export default function GlobalError({
  error,
}: {
  error: Error;
}) {
  return (
    <FullScreenError
      errorMessage={error.message}
      errorData={error instanceof TRPCClientError ? error.data : undefined}
    />
  );
}
