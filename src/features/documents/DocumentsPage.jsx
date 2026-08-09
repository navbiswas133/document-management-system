import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DocumentList } from './DocumentList';
import {
  DEFAULT_SEARCH_REQUEST_BODY,
  getDocumentApiToken,
  searchDocuments,
} from './documentsApi';
import {
  SEARCH_RESULTS_PLACEHOLDER,
  SEARCH_RESULTS_TOTAL,
} from './placeholderDocuments';
import styles from './DocumentsPage.module.css';

const EMPTY_FILTERS = {
  category: '',
  tag: '',
};

function getFilterOptions(documents) {
  const categories = [
    ...new Set(documents.map((doc) => doc.category).filter(Boolean)),
  ].sort();
  const tags = [...new Set(documents.flatMap((doc) => doc.tags))].sort();

  return { categories, tags };
}

function applyFilters(documents, filters) {
  return documents.filter((doc) => {
    if (filters.category && doc.category !== filters.category) {
      return false;
    }

    if (filters.tag && !doc.tags.includes(filters.tag)) {
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
    const matchesCategory = doc.category?.toLowerCase().includes(normalizedQuery);
    const matchesDepartment = doc.department?.toLowerCase().includes(normalizedQuery);
    const matchesDate = doc.date?.toLowerCase().includes(normalizedQuery);
    const matchesTags = doc.tags.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery),
    );

    return (
      matchesName ||
      matchesCategory ||
      matchesDepartment ||
      matchesDate ||
      matchesTags
    );
  });
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
  const [documents, setDocuments] = useState(SEARCH_RESULTS_PLACEHOLDER);
  const [totalCount, setTotalCount] = useState(SEARCH_RESULTS_TOTAL);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      const token = getDocumentApiToken();

      if (!token) {
        if (isMounted) {
          setDocuments(SEARCH_RESULTS_PLACEHOLDER);
          setTotalCount(SEARCH_RESULTS_TOTAL);
          setApiError('');
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setApiError('');
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

        setDocuments(SEARCH_RESULTS_PLACEHOLDER);
        setTotalCount(SEARCH_RESULTS_TOTAL);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setDocuments(SEARCH_RESULTS_PLACEHOLDER);
        setTotalCount(SEARCH_RESULTS_TOTAL);
        setApiError(getSearchErrorMessage(loadError));
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

  const filterOptions = useMemo(() => getFilterOptions(documents), [documents]);
  const filteredDocuments = useMemo(() => {
    const byFilters = applyFilters(documents, filters);
    return filterBySearch(byFilters, searchQuery);
  }, [documents, filters, searchQuery]);

  const resultCount = filteredDocuments.length;
  const filtersActive = Boolean(filters.category || filters.tag);

  function handleFilterChange(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS);
    setSearchQuery('');
  }

  return (
    <div className={styles.page}>
      <header className={styles.resultsHeader}>
        <div className={styles.resultsHeading}>
          <h1 className={styles.title}>Search Results</h1>
          <p className={styles.resultCount}>
            {isLoading ? 'Loading…' : `${resultCount} results found`}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link to="/documents/upload" className={styles.uploadButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Upload Document
          </Link>
          <button type="button" className={styles.outlineButton} disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Download All (ZIP)
          </button>
          <button type="button" className={styles.outlineButton} disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Export
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <section className={styles.filtersPanel} aria-label="Document filters">
        <div className={styles.filtersRow}>
          <div className={styles.searchField}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search by name, category, tag…"
              aria-label="Search documents"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filter-category">
              Category
            </label>
            <div className={styles.selectWrap}>
              <select
                id="filter-category"
                className={styles.filterSelect}
                value={filters.category}
                onChange={(event) => handleFilterChange('category', event.target.value)}
                disabled={isLoading}
              >
                <option value="">All categories</option>
                {filterOptions.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filter-tag">
              Tag
            </label>
            <div className={styles.selectWrap}>
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
              <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {(filtersActive || searchQuery.trim()) && (
            <div className={styles.filterActions}>
              <button
                type="button"
                className={styles.clearFiltersButton}
                onClick={handleClearFilters}
                disabled={isLoading}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Clear
              </button>
            </div>
          )}
        </div>
      </section>

      {apiError && (
        <p className={styles.apiNotice} role="status">
          Showing sample results. {apiError}
        </p>
      )}

      <div className={styles.listArea}>
        {isLoading && (
          <div className={styles.loadingState} role="status" aria-live="polite">
            <div className={styles.spinner} aria-hidden="true" />
            <p>Loading documents…</p>
          </div>
        )}

        {!isLoading && (
          <DocumentList
            documents={filteredDocuments}
            totalCount={totalCount}
          />
        )}
      </div>
    </div>
  );
}
