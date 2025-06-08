import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail, Phone, UserPlus, LogIn } from 'lucide-react';
import './authPage.css';
import { useAuth } from '../context/AuthContext';

const AuthApp = () => {
  const navigate = useNavigate();
  const { login, isAuth, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login');
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    fullname: '',
    username: '',
    password: '',
    confirmpassword: '',
    phonenumber: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuth) {
      console.log("User is authenticated, redirecting to home");
      navigate('/');
    }
  }, [isAuth, loading, navigate]);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authSuccess = urlParams.get('auth');
      
      if (authSuccess === 'success') {
        console.log("Google OAuth success detected");
        
        // Clean the URL immediately
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Wait for the auth context to update
        setTimeout(() => {
          // Force a check of auth status
          window.location.reload();
        }, 500);
      }
    };

    handleGoogleCallback();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setLoginForm({ username: '', password: '' });
        
        console.log("Login successful, user data:", data.user);
        
        // Use the login function from useAuth hook to update global state
        login(data.user);
        
        // Navigate to home page after successful login
        setTimeout(() => {
          navigate('/');
        }, 1000);
        
      } else {
        setErrors({ general: data.error });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Client-side validation
    const newErrors = {};
    if (!registerForm.fullname.trim()) newErrors.fullname = 'Full name is required';
    if (!registerForm.username.trim()) newErrors.username = 'Username is required';
    if (!registerForm.email.trim()) newErrors.email = 'Email is required';
    if (!registerForm.phonenumber.trim()) newErrors.phonenumber = 'Phone number is required';
    if (registerForm.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (registerForm.password !== registerForm.confirmpassword) {
      newErrors.confirmpassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setRegisterForm({
          fullname: '',
          username: '',
          password: '',
          confirmpassword: '',
          phonenumber: '',
          email: ''
        });
        
        console.log("Registration successful, user data:", data.user);
        
        // If user data is returned, use it to login
        if (data.user) {
          login(data.user);
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          // If no user data, try to get it from server
          setTimeout(async () => {
            try {
              const authResponse = await fetch('http://localhost:8000/api/auth/Glogin', {
                credentials: 'include'
              });
              if (authResponse.ok) {
                const authData = await authResponse.json();
                if (authData.user) {
                  login(authData.user);
                  navigate('/');
                }
              }
            } catch (error) {
              console.error("Error getting user data after registration:", error);
            }
          }, 500);
        }
        
      } else {
        setErrors({ general: data.error });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Store the intended redirect URL before Google OAuth
    sessionStorage.setItem('redirectAfterAuth', '/');
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  const renderLoginForm = () => (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <LogIn className="auth-icon" />
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className={`form-input ${errors.username ? 'error' : ''}`}
              />
            </div>
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className={`form-input password-input ${errors.password ? 'error' : ''}`}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={formLoading}
          >
            {formLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-btn"
            disabled={formLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="link-btn"
              onClick={() => setCurrentView('register')}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <UserPlus className="auth-icon" />
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us today</p>
        </div>

        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-grid">
            <div className="form-group">
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerForm.fullname}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullname: e.target.value })}
                  className={`form-input ${errors.fullname ? 'error' : ''}`}
                />
              </div>
              {errors.fullname && <p className="field-error">{errors.fullname}</p>}
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  placeholder="Username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                />
              </div>
              {errors.username && <p className="field-error">{errors.username}</p>}
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                />
              </div>
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <Phone className="input-icon" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={registerForm.phonenumber}
                  onChange={(e) => setRegisterForm({ ...registerForm, phonenumber: e.target.value })}
                  className={`form-input ${errors.phonenumber ? 'error' : ''}`}
                />
              </div>
              {errors.phonenumber && <p className="field-error">{errors.phonenumber}</p>}
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className={`form-input password-input ${errors.password ? 'error' : ''}`}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={registerForm.confirmpassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmpassword: e.target.value })}
                className={`form-input password-input ${errors.confirmpassword ? 'error' : ''}`}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmpassword && <p className="field-error">{errors.confirmpassword}</p>}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={formLoading}
          >
            {formLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-btn"
            disabled={formLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              className="link-btn"
              onClick={() => setCurrentView('login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // Render based on current view
  if (currentView === 'register') {
    return renderRegisterForm();
  } else {
    return renderLoginForm();
  }
};

export default AuthApp;