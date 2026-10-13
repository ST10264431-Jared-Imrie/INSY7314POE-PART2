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

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import Register from '../pages/Register';
import axiosInstance from '../api/axiosInstance';

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

describe('Register page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: renders all form fields
  test('renders register form with all required fields', () => {
    renderRegister();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i am a/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
  });

  // Test 2: shows error when passwords don't match
  test('shows error when passwords do not match', async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      'jane@example.com'
    );
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password1');
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'Different1'
    );
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/passwords do not match/i)
      ).toBeInTheDocument();
    });
  });

  // Test 3: shows error for weak password
  test('shows error for weak password (too short / no digit)', async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      'jane@example.com'
    );
    await userEvent.type(screen.getByLabelText(/^password$/i), 'weak');
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'weak'
    );
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  // Test 4: calls register API on valid submission
  test('calls register API and redirects to login on valid submission', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { message: 'User created' } });

    renderRegister();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      'jane@example.com'
    );
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password1');
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'Password1'
    );
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/auth/register', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password1',
        role: 'client',
      });
    });

    // Success message should appear before navigation
    await waitFor(() => {
      expect(
        screen.getByText(/account created successfully/i)
      ).toBeInTheDocument();
    });
  });
});
