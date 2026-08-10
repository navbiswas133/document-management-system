import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadDocumentPage } from '../UploadDocumentPage';
import { renderWithProviders } from '../../../test/test-utils';

vi.mock('../documentsApi', () => ({
  fetchDocumentTags: vi.fn(() => Promise.resolve([])),
  saveDocumentEntry: vi.fn(() => new Promise(() => {})),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('UploadDocumentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation when required fields are missing', async () => {
    const user = userEvent.setup();

    renderWithProviders(<UploadDocumentPage />, { route: '/documents/upload' });

    await user.click(screen.getByRole('button', { name: /upload document/i }));

    expect(await screen.findByText('Please select a file to upload.')).toBeInTheDocument();
    expect(screen.getByText('Date is required.')).toBeInTheDocument();
    expect(screen.getByText('Please enter atleast 1 File Tag Name.')).toBeInTheDocument();
  });

  it('disables upload button while uploading', async () => {
    const user = userEvent.setup();
    const file = new File(['pdf'], 'sample.pdf', { type: 'application/pdf' });

    const { container } = renderWithProviders(<UploadDocumentPage />, {
      route: '/documents/upload',
    });

    const fileInput = container.querySelector('#document-file');
    await user.upload(fileInput, file);
    await user.type(container.querySelector('#document-date'), '2024-01-15');
    await user.type(screen.getByPlaceholderText(/select or type a tag/i), 'finance');
    await user.keyboard('{Enter}');

    const uploadButton = screen.getByRole('button', { name: /upload document/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(uploadButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /^uploading/i })).toBeInTheDocument();
    });
  });
});
