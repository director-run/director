import { Logo } from "@director/ui/components/brand";

export default async function HomePage() {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center p-8">
      <Logo className="size-10" />
    </div>
  );
}
