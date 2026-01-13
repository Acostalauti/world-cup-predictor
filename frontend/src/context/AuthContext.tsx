import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { client } from "@/api/client";
import { components } from "@/types/api";

type User = components["schemas"]["User"];

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, name: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data, error } = await client.GET("/auth/me");
          if (data) {
            setCurrentUser(data);
          } else {
            console.error("Failed to fetch user:", error);
            localStorage.removeItem("token");
          }
        } catch (err) {
          console.error("Auth check error:", err);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await client.POST("/auth/login", {
      body: { email, password },
    });

    if (data) {
      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      return data.user;
    }
    console.error("Login failed:", error);
    return null;
  };

  const register = async (email: string, password: string, name: string): Promise<User | null> => {
    const { data, error } = await client.POST("/auth/register", {
      body: { email, password, name },
    });

    if (data) {
      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      return data.user;
    }
    console.error("Registration failed:", error);
    return null;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
