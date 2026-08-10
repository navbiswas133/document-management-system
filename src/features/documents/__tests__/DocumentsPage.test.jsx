import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentsPage } from '../DocumentsPage';
import { renderWithProviders } from '../../../test/test-utils';
import * as documentsApi from '../documentsApi';

vi.mock('../documentsApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    searchDocuments: vi.fn(),
    getDocumentApiToken: vi.fn(() => 'test-token'),
  };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and accepts user input', async () => {
    vi.mocked(documentsApi.searchDocuments).mockResolvedValue({
      status: true,
      data: [],
      recordsTotal: 0,
    });

    const user = userEvent.setup();
    renderWithProviders(<DocumentsPage />, { route: '/documents' });

    const searchInput = await screen.findByLabelText(/search documents/i);
    await user.type(searchInput, 'report');

    expect(searchInput).toHaveValue('report');
  });

  it('shows loading state while documents are loading', async () => {
    vi.mocked(documentsApi.searchDocuments).mockImplementation(
      () => new Promise(() => {}),
    );

    renderWithProviders(<DocumentsPage />, { route: '/documents' });

    expect(await screen.findByText('Loading documents…')).toBeInTheDocument();
  });

  it('shows empty state when search returns no documents', async () => {
    vi.mocked(documentsApi.searchDocuments).mockResolvedValue({
      status: true,
      data: [],
      recordsTotal: 0,
    });

    renderWithProviders(<DocumentsPage />, { route: '/documents' });

    expect(await screen.findByText('No documents found')).toBeInTheDocument();
  });
});
