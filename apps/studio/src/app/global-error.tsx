"use client"; // Error boundaries must be Client Components
import { TRPCClientError } from "@trpc/client";
import { FullScreenError } from "../components/pages/global/error";

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
