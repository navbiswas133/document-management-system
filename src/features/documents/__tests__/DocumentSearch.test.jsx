import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { DocumentSearch } from '../DocumentSearch';

const emptyFilters = {
  majorHead: '',
  minorHead: '',
  tag1: '',
  tag2: '',
  fromDate: '',
  toDate: '',
};

function SearchHarness() {
  const [filters, setFilters] = useState(emptyFilters);

  return (
    <DocumentSearch
      filters={filters}
      majorCategoryOptions={[]}
      minorCategoryOptions={[]}
      filtersActive={false}
      onFilterChange={(field, value) =>
        setFilters((current) => ({ ...current, [field]: value }))
      }
      onClear={() => setFilters(emptyFilters)}
    />
  );
}

describe('DocumentSearch', () => {
  it('renders filter panel and category controls', () => {
    render(
      <DocumentSearch
        filters={emptyFilters}
        majorCategoryOptions={['Personal', 'Professional']}
        minorCategoryOptions={['John']}
        filtersActive={false}
        onFilterChange={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Document filters')).toBeInTheDocument();
    expect(screen.getByText('Major category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Major category' })).toBeInTheDocument();
  });

  it('accepts tag filter input', async () => {
    const user = userEvent.setup();

    render(<SearchHarness />);

    const tagInput = screen.getByLabelText('Tag 1');
    await user.type(tagInput, 'invoice');

    expect(tagInput).toHaveValue('invoice');
  });
});
