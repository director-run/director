import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  isLoading: boolean;
}>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  checkAuthStatus: async () => {},
  isLoading: false,
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
  const [isLoading, setIsLoading] = useState(false);

  // check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    await simulateApiCall();
    setIsLoading(false);
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  const login = async (params: { email: string; password: string }) => {
    console.log("loginnnnnn", params);
    setIsLoading(true);
    await simulateApiCall();
    setIsLoading(false);
    console.log("good!");

    if (params.email === "bmalet@gmail.com" && params.password === "password") {
      console.log("valid!");
      const userData = {
        id: 1,
        email: params.email,
        password: params.password,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
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
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
