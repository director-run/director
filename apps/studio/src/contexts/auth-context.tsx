import { createContext, useCallback, useContext } from "react";
import { signIn, signOut, signUp, useSession } from "../lib/auth-client";

type UserStatus = "ACTIVE" | "PENDING";

type User = {
  id: string;
  email: string;
  status: UserStatus;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isPending: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  signup: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isInitializing: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isPending: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  isInitializing: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, isPending, refetch } = useSession();

  const login = useCallback(
    async (params: { email: string; password: string }) => {
      const result = await signIn.email({
        email: params.email,
        password: params.password,
      });

      if (result.error) {
        throw new Error(result.error.message || "Login failed");
      }

      // Refetch session to update auth state after successful login
      await refetch();
    },
    [refetch],
  );

  const signup = useCallback(
    async (params: { email: string; password: string }) => {
      const result = await signUp.email({
        email: params.email,
        password: params.password,
        name: params.email, // better-auth requires name, we use email as placeholder
      });

      if (result.error) {
        throw new Error(result.error.message || "Signup failed");
      }

      // Refetch session to update auth state after successful signup
      await refetch();
    },
    [refetch],
  );

  const logout = useCallback(async () => {
    await signOut();
  }, []);

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        status: ((session.user as { status?: UserStatus }).status ??
          "PENDING") as UserStatus,
      }
    : null;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!session?.user,
    isPending: user?.status === "PENDING",
    isInitializing: isPending,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
