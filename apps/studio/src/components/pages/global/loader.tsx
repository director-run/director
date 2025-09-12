import { Logo } from "@/components/ui/icons/logo";

export const FullScreenLoader = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Logo className="size-10 animate-pulse" />
    </div>
  );
};
