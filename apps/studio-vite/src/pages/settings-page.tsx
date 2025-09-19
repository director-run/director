import { useAuth } from "../contexts/auth-context";

export function SettingsPage() {
  const { user, logout, isAuthenticated, isInitializing } = useAuth();
  return (
    <div>
      <ul>
        <li>User: {JSON.stringify(user)}</li>
        <li>isAuthenticated: {JSON.stringify(isAuthenticated)}</li>
        <li>isLoading: {JSON.stringify(isInitializing)}</li>
        <li>
          <button onClick={logout}>Logout</button>
        </li>
      </ul>
    </div>
  );
}
