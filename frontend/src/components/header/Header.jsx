import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { user, isAuth, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log("Header - isAuth:", isAuth, "user:", user, "loading:", loading);
  }, [isAuth, user, loading]);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      if (response?.data?.success) {
        console.log(response.data.message || "Logged out successfully");
      } else {
        console.log(response?.data?.error || "Logout failed");
      }
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      // Always call logout to clear local state
      logout();
      navigate("/");
    }
  };

  const handleLoginClick = () => {
    navigate("/auth");
  };

  // Don't render anything while loading
  if (loading) {
    return (
      <header className="header">
        <nav className="nav">
          <button onClick={() => navigate("/")} className="logo">
            E-Learning
          </button>
          <ul className="nav-list">
            <li>
              <button onClick={() => navigate("/")} className="nav-button">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/courses")} className="nav-button">
                Courses
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/about")} className="nav-button">
                About
              </button>
            </li>
            <li>
              <span className="nav-button">Loading...</span>
            </li>
          </ul>
        </nav>
      </header>
    );
  }

  return (
    <header className="header">
      <nav className="nav">
        <button onClick={() => navigate("/")} className="logo">
          E-Learning
        </button>
        <ul className="nav-list">
          <li>
            <button onClick={() => navigate("/")} className="nav-button">
              Home
            </button>
          </li>
          <li>
            <button onClick={() => navigate("/courses")} className="nav-button">
              Courses
            </button>
          </li>
          <li>
            <button onClick={() => navigate("/about")} className="nav-button">
              About
            </button>
          </li>
          {isAuth ? (
            <>
        
              <li>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <button onClick={handleLoginClick} className="nav-button">
                Login
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;