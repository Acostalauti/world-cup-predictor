import { createContext, useContext, useState, ReactNode } from "react";
import { MockUser, mockUsers } from "@/data/mockUsers";

interface AuthContextType {
  currentUser: MockUser | null;
  setCurrentUser: (user: MockUser | null) => void;
  login: (email: string) => MockUser | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);

  const login = (email: string): MockUser | null => {
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout }}>
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
