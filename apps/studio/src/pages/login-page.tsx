import { LoginPage as LoginPageComponent } from "@director.run/design/components/pages/auth/login.tsx";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context.tsx";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const { login, isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <LoginPageComponent
      error={error}
      defaultValues={{ email: "user@director.run", password: "password" }}
      onSubmit={async (credentials) => {
        try {
          setError(null);
          setIsLoading(true);
          await login(credentials);
          navigate("/", { replace: true });
        } catch (err) {
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
      }}
      isLoading={isLoading}
      signupLink={
        <Link to="/signup" className="text-fg underline hover:no-underline">
          Sign up
        </Link>
      }
    />
  );
}
