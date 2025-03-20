import { Logo } from "@director/ui/components/brand";

import "./App.css";

export function App() {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center p-8">
      <Logo className="size-10" />
    </div>
  );
}
