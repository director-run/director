"use client"; // Error boundaries must be Client Components
import { FullScreenError } from "@/components/pages/global/error";
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
