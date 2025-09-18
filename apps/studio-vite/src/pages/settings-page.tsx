import { useAuth } from "../contexts/auth-context";

export function SettingsPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <ul>
        <li>User: {JSON.stringify(user)}</li>
        <li>isAuthenticated: {JSON.stringify(isAuthenticated)}</li>
        <li>isLoading: {JSON.stringify(isLoading)}</li>
        <li>
          <button onClick={logout}>Logout</button>
        </li>
      </ul>
    </div>
  );
}
