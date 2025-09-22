import { LoginPage as LoginPageComponent } from "@director.run/studio/components/pages/auth/login.tsx";
import { useState } from "react";
import { useAuth } from "../contexts/auth-context.tsx";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { login } = useAuth();
  return (
    <LoginPageComponent
      error={error}
      defaultValues={{
        email: "barnaby@example.com",
        password: "password",
      }}
      onSubmit={async (user) => {
        try {
          await setIsLoading(true);
          await login(user);
        } catch (error) {
          await setError(error as Error);
        } finally {
          await setIsLoading(false);
        }
      }}
      isLoading={isLoading}
    />
  );
}
