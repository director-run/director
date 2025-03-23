import { Logo } from "@director/ui/components/brand";

export default async function HomePage() {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center p-8">
      <Logo />

      <h1 className="font-bold font-sans text-4xl">This is geist</h1>
      <h1 className="font-bold font-mono text-4xl">This is jetbrains mono</h1>
    </div>
  );
}
