import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  checkAuthStatus: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type User = {
  id: number;
  email: string;
  password: string;
};

async function simulateApiCall() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    await simulateApiCall();
    setUser({
      id: 1,
      email: "bmalet@gmail.com",
      password: "password",
    });
  };

  const login = async (params: { email: string; password: string }) => {
    await simulateApiCall();
    if (params.email === "bmalet@gmail.com" && params.password === "password") {
      const userData = {
        id: 1,
        email: params.email,
        password: params.password,
      };

      setUser(userData);
      // Todo:: store in local storage
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
