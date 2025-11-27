import { WaitlistPage as WaitlistPageComponent } from "@director.run/design/components/pages/auth/waitlist.tsx";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context.tsx";

export function WaitlistPage() {
  const { user, isAuthenticated, isPending, logout } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect active users to home (e.g., after admin activates their account)
  if (!isPending) {
    return <Navigate to="/" replace />;
  }

  return (
    <WaitlistPageComponent
      email={user?.email}
      logoutLink={
        <button
          type="button"
          onClick={() => logout()}
          className="text-fg underline hover:no-underline"
        >
          Sign out
        </button>
      }
    />
  );
}
