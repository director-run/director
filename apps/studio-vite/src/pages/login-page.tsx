import { useState } from "react";
import { LoginForm } from "../components/forms/login-form.tsx";
import { useAuth } from "../contexts/auth-context.tsx";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { login } = useAuth();
  return (
    <>
      {error && <div style={{ color: "red" }}>ERROR: {error.message}</div>}
      <LoginForm
        defaultValues={{ email: "bmalet@gmail.com", password: "password" }}
        onSubmit={async (user) => {
          console.log("user", user);
          try {
            await setIsLoading(true);
            await login(user);
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
