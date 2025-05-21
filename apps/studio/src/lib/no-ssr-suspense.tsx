import { Loader } from "@/components/ui/loader";
import { useIsClient } from "@/hooks/use-is-client";
import { ComponentProps, Suspense } from "react";

export function DefaultFallback() {
  return (
    <div className="grid grow place-items-center">
      <Loader className="animate-pulse text-foreground-subtle" />
    </div>
  );
}

export function NoSSRSuspense(props: ComponentProps<typeof Suspense>) {
  const isClient = useIsClient();

  return <>{isClient ? <Suspense {...props} /> : props.fallback}</>;
}
