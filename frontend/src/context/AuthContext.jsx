import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage
        const savedAuth = localStorage.getItem("auth");
        const savedUser = localStorage.getItem("user");
        
        if (savedAuth === "true" && savedUser) {
          setIsAuth(true);
          setUser(JSON.parse(savedUser));
          setLoading(false);
          return;
        }

        // Then check server session
        const response = await fetch('http://localhost:8000/api/auth/Glogin', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            console.log("Server session found:", data.user);
            setIsAuth(true);
            setUser(data.user);
            localStorage.setItem("auth", "true");
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // Clear invalid data
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        setIsAuth(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = (userData) => {
    console.log("AuthContext login called with:", userData);
    setIsAuth(true);
    setUser(userData);
    localStorage.setItem("auth", "true");
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout function
  const logout = async () => {
    try {
      // Call server logout endpoint
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error("Server logout error:", error);
    } finally {
      // Always clear local state
      setIsAuth(false);
      setUser(null);
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
    }
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