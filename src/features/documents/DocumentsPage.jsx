import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DocumentList } from './DocumentList';
import styles from './DocumentsPage.module.css';

// Static placeholder data for visual development only — not from the API.
const PLACEHOLDER_DOCUMENTS = [
  {
    id: 'placeholder-1',
    name: 'Annual Report 2024.pdf',
    type: 'PDF',
    uploadedAt: '15 Mar 2024',
    tags: ['finance', 'annual'],
  },
  {
    id: 'placeholder-2',
    name: 'Project Proposal.docx',
    type: 'DOCX',
    uploadedAt: '10 Mar 2024',
    tags: ['projects'],
  },
  {
    id: 'placeholder-3',
    name: 'Meeting Notes — Q1 Review.txt',
    type: 'TXT',
    uploadedAt: '5 Mar 2024',
    tags: ['meetings', 'notes'],
  },
];

const EMPTY_FILTERS = {
  type: '',
  tag: '',
  month: '',
};

function getUploadMonth(uploadedAt) {
  return uploadedAt.split(' ').slice(1).join(' ');
}

function getFilterOptions(documents) {
  const types = [...new Set(documents.map((doc) => doc.type))].sort();
  const tags = [...new Set(documents.flatMap((doc) => doc.tags))].sort();
  const months = [...new Set(documents.map((doc) => getUploadMonth(doc.uploadedAt)))].sort();

  return { types, tags, months };
}

function applyFilters(documents, filters) {
  return documents.filter((doc) => {
    if (filters.type && doc.type !== filters.type) {
      return false;
    }

    if (filters.tag && !doc.tags.includes(filters.tag)) {
      return false;
    }

    if (filters.month && getUploadMonth(doc.uploadedAt) !== filters.month) {
      return false;
    }

    return true;
  });
}

function filterBySearch(documents, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return documents;

  return documents.filter((doc) => {
    const matchesName = doc.name.toLowerCase().includes(normalizedQuery);
    const matchesType = doc.type.toLowerCase().includes(normalizedQuery);
    const matchesDate = doc.uploadedAt.toLowerCase().includes(normalizedQuery);
    const matchesTags = doc.tags.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery),
    );

    return matchesName || matchesType || matchesDate || matchesTags;
  });
}

function hasActiveFilters(filters) {
  return Boolean(filters.type || filters.tag || filters.month);
}

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterOptions = getFilterOptions(PLACEHOLDER_DOCUMENTS);
  const trimmedQuery = searchQuery.trim();
  const filteredByFilters = applyFilters(PLACEHOLDER_DOCUMENTS, filters);
  const filteredDocuments = filterBySearch(filteredByFilters, searchQuery);
  const filtersActive = hasActiveFilters(filters);
  const hasSearchQuery = trimmedQuery.length > 0;
  const hasNoResults =
    filteredDocuments.length === 0 && (hasSearchQuery || filtersActive);

  function handleFilterChange(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function handleClearSearch() {
    setSearchQuery('');
  }

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  function handleClearAll() {
    setSearchQuery('');
    setFilters(EMPTY_FILTERS);
  }

  function toggleFilterPanel() {
    setIsFilterOpen((open) => !open);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Documents</h1>
          <p className={styles.description}>
            Browse, search, and manage all uploaded files in one place.
          </p>
        </div>
        <Link to="/documents/upload" className={styles.uploadButton}>
          Upload Document
        </Link>
      </header>

      <section className={styles.toolbar} aria-label="Document filters">
        <div className={styles.toolbarRow}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search documents…"
              aria-label="Search documents"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {hasSearchQuery && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="button"
            className={`${styles.filterButton} ${isFilterOpen ? styles.filterButtonActive : ''}`}
            onClick={toggleFilterPanel}
            aria-expanded={isFilterOpen}
            aria-controls="document-filters-panel"
          >
            <span className={styles.filterIcon} aria-hidden="true" />
            Filters
            {filtersActive && (
              <span className={styles.filterBadge} aria-hidden="true" />
            )}
          </button>
        </div>

        {isFilterOpen && (
          <div
            id="document-filters-panel"
            className={styles.filterPanel}
            role="region"
            aria-label="Document filter options"
          >
            <div className={styles.filterFields}>
              <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="filter-type">
                  File type
                </label>
                <select
                  id="filter-type"
                  className={styles.filterSelect}
                  value={filters.type}
                  onChange={(event) => handleFilterChange('type', event.target.value)}
                >
                  <option value="">All types</option>
                  {filterOptions.types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="filter-tag">
                  Tag
                </label>
                <select
                  id="filter-tag"
                  className={styles.filterSelect}
                  value={filters.tag}
                  onChange={(event) => handleFilterChange('tag', event.target.value)}
                >
                  <option value="">All tags</option>
                  {filterOptions.tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="filter-month">
                  Upload month
                </label>
                <select
                  id="filter-month"
                  className={styles.filterSelect}
                  value={filters.month}
                  onChange={(event) => handleFilterChange('month', event.target.value)}
                >
                  <option value="">All months</option>
                  {filterOptions.months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filtersActive && (
              <button
                type="button"
                className={styles.clearFiltersButton}
                onClick={handleClearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      <div className={styles.listArea}>
        {hasNoResults ? (
          <div className={styles.noResults} role="status">
            <p className={styles.noResultsTitle}>No matching documents</p>
            <p className={styles.noResultsText}>
              {hasSearchQuery && filtersActive
                ? `Nothing matches your search and current filters.`
                : hasSearchQuery
                  ? `Nothing matches "${trimmedQuery}". Try a different name, type, or tag.`
                  : 'Nothing matches your current filters. Try adjusting file type, tag, or month.'}
            </p>
            <button
              type="button"
              className={styles.noResultsAction}
              onClick={handleClearAll}
            >
              {hasSearchQuery && filtersActive
                ? 'Clear search and filters'
                : hasSearchQuery
                  ? 'Clear search'
                  : 'Clear filters'}
            </button>
          </div>
        ) : (
          <DocumentList documents={filteredDocuments} />
        )}
        {PLACEHOLDER_DOCUMENTS.length > 0 && (
          <p className={styles.placeholderNote}>
            Showing placeholder data for visual development.
          </p>
        )}
      </div>
    </div>
  );
}
