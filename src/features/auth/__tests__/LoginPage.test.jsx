import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import { renderWithProviders } from '../../../test/test-utils';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../authApi', () => ({
  generateOTP: vi.fn(() => Promise.resolve({})),
  validateOTP: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mobile number input', () => {
    renderWithProviders(<LoginPage />, {
      auth: {
        token: null,
        user_id: null,
        user_name: null,
        roles: [],
        portal: 'user',
      },
    });

    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter mobile number/i)).toBeInTheDocument();
  });

  it('shows validation when mobile is empty', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginPage />, {
      auth: {
        token: null,
        user_id: null,
        user_name: null,
        roles: [],
        portal: 'user',
      },
    });

    await user.click(screen.getByRole('button', { name: /^send otp$/i }));

    expect(await screen.findByText('Mobile number is required')).toBeInTheDocument();
  });

  it('shows OTP UI after sending OTP', async () => {
    const user = userEvent.setup();
    const { generateOTP } = await import('../authApi');

    renderWithProviders(<LoginPage />, {
      auth: {
        token: null,
        user_id: null,
        user_name: null,
        roles: [],
        portal: 'user',
      },
    });

    await user.type(screen.getByLabelText(/mobile number/i), '9876543210');
    await user.click(screen.getByRole('button', { name: /^send otp$/i }));

    expect(generateOTP).toHaveBeenCalledWith('9876543210');
    expect(await screen.findByText('Enter OTP')).toBeInTheDocument();
    expect(screen.getByLabelText('OTP digit 1')).toBeInTheDocument();
  });
});
