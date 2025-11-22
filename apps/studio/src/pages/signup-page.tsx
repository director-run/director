import { SignupPage as SignupPageComponent } from "@director.run/design/components/pages/auth/signup.tsx";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context.tsx";

export function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const { signup, isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <SignupPageComponent
      error={error}
      onSubmit={async (credentials) => {
        try {
          setError(null);
          setIsLoading(true);
          await signup(credentials);
          navigate("/", { replace: true });
        } catch (err) {
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
      }}
      isLoading={isLoading}
      loginLink={
        <Link to="/login" className="text-fg underline hover:no-underline">
          Log in
        </Link>
      }
    />
  );
}
