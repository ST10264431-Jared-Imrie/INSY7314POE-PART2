import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => {
    // min 8 chars, at least one letter and one digit
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters and contain both letters and digits.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role.';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/register', {
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setSuccessMsg('Account created successfully! Redirecting to login…');
      setTimeout(() => {
        navigate('/login', { state: { registered: true } });
      }, 1500);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-card__header">
          <h1 className="register-card__title">Create Account</h1>
          <p className="register-card__subtitle">Join HustleHub+ today</p>
        </div>

        {apiError && (
          <div className="register-alert register-alert--error" role="alert">
            {apiError}
          </div>
        )}

        {successMsg && (
          <div className="register-alert register-alert--success" role="status">
            {successMsg}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              autoComplete="name"
            />
            {errors.name && (
              <span className="form-error" role="alert">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <span className="form-error" role="alert">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'form-input--error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars, letters and digits"
              autoComplete="new-password"
            />
            {errors.password && (
              <span className="form-error" role="alert">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="form-error" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">I am a…</label>
            <select
              id="role"
              name="role"
              className={`form-input form-select ${errors.role ? 'form-input--error' : ''}`}
              value={formData.role}
              onChange={handleChange}
            >
              <option value="client">Client (I want to hire)</option>
              <option value="freelancer">Freelancer (I want to work)</option>
            </select>
            {errors.role && (
              <span className="form-error" role="alert">{errors.role}</span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="register-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="register-card__link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
