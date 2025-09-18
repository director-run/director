import { useState } from "react";
import { LoginForm } from "../components/forms/login-form.tsx";
import { useAuth } from "../contexts/auth-context.tsx";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { login } = useAuth();
  return (
    <>
      {error && <div>ERROR: {error.message}</div>}
      <LoginForm
        onSubmit={async (user) => {
          try {
            await login(user);
            await setIsLoading(true);
          } catch (error) {
            await setError(error as Error);
          } finally {
            await setIsLoading(false);
          }
        }}
        isSubmitting={isLoading}
      />
    </>
  );
}
