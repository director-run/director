import { Logo } from "@director/ui/components/brand";

import "./App.css";
import { trpc } from "./trpc/client";

export function App() {
  const { data, isLoading } = trpc.greeting.useQuery({ name: "User" });

  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center p-8">
      <Logo className="size-10" />
    </div>
    <main className="container">
      <h1>Welcome to Director</h1>

      <div className="row">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>

      <div>
        <h2>Gateways</h2>
        Data = {data}
        <br />
        isLoading = {isLoading}
      </div>
    </main>
  );
}
