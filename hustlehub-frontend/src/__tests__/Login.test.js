/* eslint-disable */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// ── Mock axiosInstance ──
jest.mock('../api/axiosInstance', () => ({
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

// ── Mock AuthContext ──
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    loading: false,
    login: mockLogin,
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }) => <>{children}</>,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import Login from '../pages/Login';
import axiosInstance from '../api/axiosInstance';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: renders the login form
  test('renders login form with email and password fields', () => {
    renderLogin();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  // Test 2: shows validation error for invalid email
  test('shows validation error when email is invalid', async () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'not-an-email');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  // Test 3: shows validation error when password is empty
  test('shows validation error when password is empty', async () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'user@example.com');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/password is required/i)
      ).toBeInTheDocument();
    });
  });

  // Test 4: calls API and stores token on successful login
  test('calls login API and stores token on successful login', async () => {
    const fakeToken = 'fake-jwt-token';
    const fakeUser = { id: '1', name: 'Alice', email: 'alice@example.com', role: 'client' };

    axiosInstance.post.mockResolvedValueOnce({
      data: { token: fakeToken, user: fakeUser },
    });

    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'alice@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'alice@example.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith(fakeUser, fakeToken);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/client');
    });
  });
});
