import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isInitializing: boolean;
}>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isInitializing: false,
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
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsInitializing(true);
    await simulateApiCall();
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsInitializing(false);
  };

  const login = async (params: { email: string; password: string }) => {
    console.log("loginnnnnn", params);
    await simulateApiCall();

    if (
      params.email === "barnaby@example.com" &&
      params.password === "password"
    ) {
      const userData = {
        id: 1,
        email: params.email,
        password: params.password,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("good!");
    } else {
      console.log("invalid!");
      throw new Error("Invalid email or password");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isInitializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
