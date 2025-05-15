import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Check if the user is already authenticated (via localStorage)
  useEffect(() => {
    const storedAuth = localStorage.getItem("cl_auth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const setupFetch = (pin: string) => {
    // Add PIN to request headers for future API calls
    window.originalFetch = window.fetch;
    window.fetch = function(input, init) {
      init = init || {};
      init.headers = init.headers || {};
      
      // Add PIN to Authorization header
      (init.headers as Record<string, string>)["Authorization"] = pin;
      
      return window.originalFetch!(input, init);
    };
  };

  // Check if we have a stored PIN on component mount
  useEffect(() => {
    const pin = localStorage.getItem("cl_pin");
    if (pin) {
      setupFetch(pin);
    }
  }, []);

  const login = (pin: string): boolean => {
    // Validate the PIN (4079)
    if (pin === "4079") {
      setIsAuthenticated(true);
      // Store authentication state in localStorage
      localStorage.setItem("cl_auth", "true");
      
      // Also set the PIN as authorization for API requests
      localStorage.setItem("cl_pin", pin);
      
      // Setup fetch with our PIN
      setupFetch(pin);
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("cl_auth");
    localStorage.removeItem("cl_pin");
    
    // Reset fetch to original behavior
    if (window.originalFetch) {
      window.fetch = window.originalFetch;
    }
    
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
