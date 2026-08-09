import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DocumentList } from './DocumentList';
import {
  DEFAULT_SEARCH_REQUEST_BODY,
  getDocumentApiToken,
  searchDocuments,
} from './documentsApi';
import styles from './DocumentsPage.module.css';

const EMPTY_FILTERS = {
  type: '',
  tag: '',
  month: '',
};

function getUploadMonth(uploadedAt) {
  return uploadedAt.split(' ').slice(1).join(' ');
}

function getFilterOptions(documents) {
  const types = [...new Set(documents.map((doc) => doc.type).filter(Boolean))].sort();
  const tags = [...new Set(documents.flatMap((doc) => doc.tags))].sort();
  const months = [
    ...new Set(
      documents
        .map((doc) => doc.uploadedAt)
        .filter(Boolean)
        .map((uploadedAt) => getUploadMonth(uploadedAt)),
    ),
  ].sort();

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

function getSearchErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (error.response?.statusText) {
    return error.response.statusText;
  }

  return 'Unable to load documents. Please try again.';
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      const token = getDocumentApiToken();

      if (!token) {
        if (isMounted) {
          setError(
            'Document search requires a valid API token. Authentication is not connected to document requests yet.',
          );
          setDocuments([]);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setError('');
      }

      try {
        const response = await searchDocuments(
          DEFAULT_SEARCH_REQUEST_BODY,
          token,
        );

        if (!isMounted) {
          return;
        }

        if (import.meta.env.DEV) {
          console.info(
            '[documents] searchDocumentEntry response (not mapped):',
            response.data,
          );
        }

        // Response structure is undocumented — do not map into list fields yet.
        setDocuments([]);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setDocuments([]);
        setError(getSearchErrorMessage(loadError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filterOptions = getFilterOptions(documents);
  const trimmedQuery = searchQuery.trim();
  const filteredByFilters = applyFilters(documents, filters);
  const filteredDocuments = filterBySearch(filteredByFilters, searchQuery);
  const filtersActive = hasActiveFilters(filters);
  const hasSearchQuery = trimmedQuery.length > 0;
  const hasNoResults =
    !isLoading &&
    !error &&
    filteredDocuments.length === 0 &&
    (hasSearchQuery || filtersActive);

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
              className={`${styles.searchInput} ${hasSearchQuery ? styles.searchInputWithClear : ''}`}
              placeholder="Search documents…"
              aria-label="Search documents"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              disabled={isLoading}
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
            aria-label={filtersActive ? 'Filters (active)' : 'Show filters'}
            disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                disabled={isLoading}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      <div className={styles.listArea}>
        {isLoading && (
          <div className={styles.loadingState} role="status" aria-live="polite">
            <div className={styles.spinner} aria-hidden="true" />
            <p>Loading documents…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className={styles.errorState} role="alert">
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}

        {!isLoading && !error && hasNoResults && (
          <div className={styles.noResults} role="status">
            <p className={styles.noResultsTitle}>No matching documents</p>
            <p className={styles.noResultsText}>
              {hasSearchQuery && filtersActive
                ? 'Nothing matches your search and current filters.'
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
        )}

        {!isLoading && !error && !hasNoResults && (
          <DocumentList documents={filteredDocuments} />
        )}
      </div>
    </div>
  );
}
