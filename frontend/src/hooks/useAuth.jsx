
import { useState, useEffect, createContext, useContext } from 'react';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedAuth = localStorage.getItem("auth");
        const savedUser = localStorage.getItem("user");
        
        if (savedAuth === "true" && savedUser) {
          setIsAuth(true);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // Clear invalid data
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = (userData) => {
    setIsAuth(true);
    setUser(userData);
    localStorage.setItem("auth", "true");
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setIsAuth(false);
    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    isAuth,
    loading,
    setUser,
    setIsAuth,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};