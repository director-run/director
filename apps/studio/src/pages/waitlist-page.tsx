import { WaitlistPage as WaitlistPageComponent } from "@director.run/design/components/pages/auth/waitlist.tsx";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context.tsx";

export function WaitlistPage() {
  const { user, isAuthenticated, logout } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Note: We don't redirect active users away - they can navigate away themselves.
  // This page is shown when the API returns USER_PENDING error.

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
