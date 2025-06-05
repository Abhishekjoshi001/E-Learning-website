import React, { useState, useEffect } from "react";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ onLogout }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch('http://localhost:8000/api/auth/Glogin', {
        credentials: 'include'
      });
      console.log('Auth response status:', response.status);
             
      if (response.ok) {
        const data = await response.json();
        console.log('Auth data:', data);
        setUser(data.user);
        setIsAuth(true);
        console.log('User authenticated:', data.user);
      } else {
        console.log('User not authenticated');
        setIsAuth(false);
        setUser(null);
      }
    } catch (error) {
      console.log('Auth check error:', error);
      setIsAuth(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API if needed
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setIsAuth(false);
      setUser(null);
      if (onLogout) {
        onLogout();
      }
      navigate('/'); // Redirect to home page after logout
    }
  };

  const handleLogin = (userData) => {
    console.log('Setting user as authenticated:', userData);
    setIsAuth(true);
    setUser(userData);
  };

  console.log('Current auth state - isAuth:', isAuth, 'user:', user);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <header>
      <nav>
        <Link to="/" className="logo">E-Learning</Link>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/courses">Courses</Link></li>
          <li><Link to="/about">About</Link></li>
          {isAuth ? (
            <>
              <li><Link to="/account">Account</Link></li>
              <li>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login">Login</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;