import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { getApiErrorMessage } from '../../lib/apiResponse';
import { DocumentList } from './DocumentList';
import {
  buildSearchRequestBody,
  getDocumentApiToken,
  PAGE_SIZE,
  searchDocuments,
} from './documentsApi';
import { parseSearchDocumentResponse } from './searchDocumentResponse';
import styles from './DocumentsPage.module.css';

const EMPTY_FILTERS = {
  category: '',
  tag: '',
};

const SEARCH_DEBOUNCE_MS = 400;

function getFilterOptions(documents) {
  const categories = [
    ...new Set(documents.map((doc) => doc.category).filter(Boolean)),
  ].sort();
  const tags = [
    ...new Set(
      documents.flatMap((doc) =>
        Array.isArray(doc.tags)
          ? doc.tags.map((tag) =>
              typeof tag === 'string' ? tag : tag?.tag_name,
            ).filter(Boolean)
          : [],
      ),
    ),
  ].sort();

  return { categories, tags };
}

function getRequestKey(searchValue, filterState, page) {
  return JSON.stringify({
    search: searchValue.trim(),
    tag: filterState.tag,
    category: filterState.category,
    page,
  });
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const lastRequestKeyRef = useRef('');
  const skipDebouncedSearchRef = useRef(true);

  const fetchDocuments = useCallback(async (searchValue, filterState, page) => {
    const normalizedSearch = searchValue.trim();
    const requestKey = getRequestKey(normalizedSearch, filterState, page);

    if (requestKey === lastRequestKeyRef.current) {
      return;
    }

    lastRequestKeyRef.current = requestKey;

    const token = getDocumentApiToken();

    if (!token) {
      setDocuments([]);
      setTotalCount(0);
      setApiError('Authentication required.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setApiError('');

    const requestBody = buildSearchRequestBody({
      searchValue: normalizedSearch,
      tag: filterState.tag,
      majorHead: filterState.category,
      start: (page - 1) * PAGE_SIZE,
      length: PAGE_SIZE,
    });

    try {
      const responseData = await searchDocuments(requestBody);
      const { documents: entries, total } = parseSearchDocumentResponse(
        responseData,
      );

      setDocuments(entries);
      setTotalCount(total);
      setCurrentPage(page);
    } catch (loadError) {
      setDocuments([]);
      setTotalCount(0);
      setApiError(
        getApiErrorMessage(loadError, 'Unable to load documents. Please try again.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearchFetch = useMemo(
    () =>
      debounce((searchValue) => {
        lastRequestKeyRef.current = '';
        setCurrentPage(1);
        fetchDocuments(searchValue, filtersRef.current, 1);
      }, SEARCH_DEBOUNCE_MS),
    [fetchDocuments],
  );

  useEffect(() => {
    return () => {
      debouncedSearchFetch.cancel();
    };
  }, [debouncedSearchFetch]);

  useEffect(() => {
    lastRequestKeyRef.current = '';
    setCurrentPage(1);
    fetchDocuments(searchQuery, filters, 1);
  }, [filters.tag, filters.category, fetchDocuments]);

  useEffect(() => {
    if (skipDebouncedSearchRef.current) {
      skipDebouncedSearchRef.current = false;
      return;
    }

    debouncedSearchFetch(searchQuery);
  }, [searchQuery, debouncedSearchFetch]);

  const filterOptions = useMemo(() => getFilterOptions(documents), [documents]);
  const filtersActive = Boolean(filters.category || filters.tag);

  function handleFilterChange(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS);
    setSearchQuery('');
  }

  function handlePageChange(page) {
    if (page === currentPage || page < 1) {
      return;
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    if (page > totalPages) {
      return;
    }

    fetchDocuments(searchQuery, filters, page);
  }

  return (
    <div className={styles.page}>
      <header className={styles.resultsHeader}>
        <div className={styles.resultsHeading}>
          <h1 className={styles.title}>Search Results</h1>
          <p className={styles.resultCount}>
            {isLoading ? 'Loading…' : `${totalCount} results found`}
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
        <p className={styles.apiNotice} role="alert">
          {apiError}
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
            documents={documents}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
