"use client";

import { CircleNotch } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoadingView() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background">
      <CircleNotch className="size-10 animate-spin text-foreground/50" />
    </div>
  );
}

interface RedirectViewProps {
  redirectTo: string;
  replace?: boolean;
}

export function RedirectView({
  redirectTo,
  replace = false,
}: RedirectViewProps) {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(redirectTo);
    } else {
      router.push(redirectTo);
    }
  }, [redirectTo, replace, router]);

  return <LoadingView />;
}
