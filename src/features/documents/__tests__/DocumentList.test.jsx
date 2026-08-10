import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DocumentList } from '../DocumentList';

describe('DocumentList', () => {
  it('renders empty state when there are no documents', () => {
    render(
      <MemoryRouter>
        <DocumentList documents={[]} totalCount={0} currentPage={1} pageSize={10} />
      </MemoryRouter>,
    );

    expect(screen.getByText('No documents found')).toBeInTheDocument();
    expect(
      screen.getByText(/try adjusting your search or upload a new document/i),
    ).toBeInTheDocument();
  });
});
