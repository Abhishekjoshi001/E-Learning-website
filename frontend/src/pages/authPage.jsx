import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Phone, UserPlus, LogIn, LogOut, Edit } from 'lucide-react';
import './authPage.css';

const AuthApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const [updateForm, setUpdateForm] = useState({
    fullname: '',
    username: '',
    phonenumber: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is already logged in on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setUpdateForm({
        fullname: user.fullname || '',
        username: user.username || '',
        phonenumber: user.phone || user.phonenumber || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/Glogin', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        setUser(data.user);
        setLoginForm({ username: '', password: '' });
        setCurrentView('dashboard');
      } else {
        setErrors({ general: data.error });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
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
        setUser(data.user);
        setRegisterForm({
          fullname: '',
          username: '',
          password: '',
          confirmpassword: '',
          phonenumber: '',
          email: ''
        });
        setCurrentView('dashboard');
      } else {
        setErrors({ general: data.error });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        setCurrentView('login');
        setSuccessMessage('Logged out successfully');
      }
    } catch (error) {
      setErrors({ general: 'Logout failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/user/updateprofile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Profile updated successfully');
        setUser({ ...user, ...updateForm });
      } else {
        setErrors({ general: data.error });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

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
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-btn"
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
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-btn"
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

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-nav">
          <div className="user-info">
            <div className="user-avatar">
              {user?.fullname?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h2>Welcome, {user?.fullname || 'User'}!</h2>
              <p>Manage your account settings</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-btn"
            disabled={loading}
          >
            <LogOut size={20} />
            <span>{loading ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="profile-card">
          <div className="profile-header">
            <h3>Profile Information</h3>
            <button 
              type="button" 
              className="edit-btn"
              onClick={() => setCurrentView('editProfile')}
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
          
          <div className="profile-grid">
            <div className="profile-section">
              <div className="profile-field">
                <label>Full Name</label>
                <p>{user?.fullname}</p>
              </div>
              <div className="profile-field">
                <label>Username</label>
                <p>{user?.username}</p>
              </div>
            </div>
            <div className="profile-section">
              <div className="profile-field">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <p>{user?.phone || user?.phonenumber}</p>
              </div>
            </div>
          </div>
          
          {user?.role && (
            <div className="profile-field">
              <label>Role</label>
              <p>{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEditProfile = () => (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <Edit className="auth-icon" />
          <h2 className="auth-title">Edit Profile</h2>
          <p className="auth-subtitle">Update your information</p>
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

        <form onSubmit={handleUpdateProfile} className="auth-form">
          <div className="form-grid">
            <div className="form-group">
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={updateForm.fullname}
                  onChange={(e) => setUpdateForm({ ...updateForm, fullname: e.target.value })}
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
                  value={updateForm.username}
                  onChange={(e) => setUpdateForm({ ...updateForm, username: e.target.value })}
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
                  value={updateForm.email}
                  onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
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
                  value={updateForm.phonenumber}
                  onChange={(e) => setUpdateForm({ ...updateForm, phonenumber: e.target.value })}
                  className={`form-input ${errors.phonenumber ? 'error' : ''}`}
                />
              </div>
              {errors.phonenumber && <p className="field-error">{errors.phonenumber}</p>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render based on current view and authentication status
  if (user && currentView === 'dashboard') {
    return renderDashboard();
  } else if (user && currentView === 'editProfile') {
    return renderEditProfile();
  } else if (currentView === 'register') {
    return renderRegisterForm();
  } else {
    return renderLoginForm();
  }
};

export default AuthApp;