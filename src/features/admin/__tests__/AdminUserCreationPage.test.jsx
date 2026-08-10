import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminUserCreationPage } from '../AdminUserCreationPage';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('AdminUserCreationPage', () => {
  it('renders username and password fields', () => {
    render(<AdminUserCreationPage />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
  });

  it('shows required validation on empty submit', async () => {
    const user = userEvent.setup();

    render(<AdminUserCreationPage />);

    await user.click(screen.getByRole('button', { name: /^create user$/i }));

    expect(await screen.findByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });
});
