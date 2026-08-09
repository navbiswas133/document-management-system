import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { getApiErrorMessage } from '../../lib/apiResponse';
import {
  DocumentSearch,
  getDefaultMajorCategories,
  getMinorCategories,
} from './DocumentSearch';
import { DocumentList } from './DocumentList';
import {
  buildSearchRequestBody,
  getDocumentApiToken,
  PAGE_SIZE,
  searchDocuments,
} from './documentsApi';
import { downloadSearchResultsAsZip } from './documentFileActions';
import { formatSearchDateForApi } from './searchFilters';
import { parseSearchDocumentResponse } from './searchDocumentResponse';
import styles from './DocumentsPage.module.css';

const EMPTY_FILTERS = {
  majorHead: '',
  minorHead: '',
  tag1: '',
  tag2: '',
  fromDate: '',
  toDate: '',
};

const SEARCH_DEBOUNCE_MS = 400;

function isAbortError(error) {
  return (
    error?.name === 'CanceledError' ||
    error?.name === 'AbortError' ||
    error?.code === 'ERR_CANCELED'
  );
}

function hasActiveFilters(filters, searchQuery) {
  return Boolean(
    searchQuery.trim() ||
      filters.majorHead ||
      filters.minorHead ||
      filters.tag1.trim() ||
      filters.tag2.trim() ||
      filters.fromDate ||
      filters.toDate,
  );
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [downloadNotice, setDownloadNotice] = useState('');
  const [downloadNoticeType, setDownloadNoticeType] = useState('success');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  const abortControllerRef = useRef(null);
  const skipFilterScheduleRef = useRef(true);

  const fetchDocuments = useCallback(async (searchValue, filterState, page) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const token = getDocumentApiToken();

    if (!token) {
      setDocuments([]);
      setTotalCount(0);
      setApiError('Authentication required.');
      setIsLoading(false);
      abortControllerRef.current = null;
      return;
    }

    setIsLoading(true);
    setApiError('');

    const normalizedSearch = searchValue.trim();
    const requestBody = buildSearchRequestBody({
      searchValue: normalizedSearch,
      majorHead: filterState.majorHead,
      minorHead: filterState.minorHead,
      tags: [filterState.tag1.trim(), filterState.tag2.trim()],
      fromDate: formatSearchDateForApi(filterState.fromDate),
      toDate: formatSearchDateForApi(filterState.toDate),
      start: (page - 1) * PAGE_SIZE,
      length: PAGE_SIZE,
    });

    try {
      const responseData = await searchDocuments(requestBody, {
        signal: controller.signal,
      });

      const { documents: entries, total } = parseSearchDocumentResponse(
        responseData,
      );

      setDocuments(entries);
      setTotalCount(total);
      setCurrentPage(page);
    } catch (loadError) {
      if (isAbortError(loadError)) {
        return;
      }

      setDocuments([]);
      setTotalCount(0);
      setApiError(
        getApiErrorMessage(loadError, 'Unable to load documents. Please try again.'),
      );
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, []);

  const debouncedListFetch = useMemo(
    () =>
      debounce(() => {
        fetchDocuments(searchQueryRef.current, filtersRef.current, 1);
      }, SEARCH_DEBOUNCE_MS),
    [fetchDocuments],
  );

  useEffect(() => {
    fetchDocuments(searchQueryRef.current, filtersRef.current, 1);

    const enableFilterScheduleTimer = setTimeout(() => {
      skipFilterScheduleRef.current = false;
    }, 0);

    return () => {
      clearTimeout(enableFilterScheduleTimer);
    };
  }, [fetchDocuments]);

  useEffect(() => {
    if (skipFilterScheduleRef.current) {
      return;
    }

    setCurrentPage(1);
    debouncedListFetch();
  }, [
    searchQuery,
    filters.majorHead,
    filters.minorHead,
    filters.fromDate,
    filters.toDate,
    filters.tag1,
    filters.tag2,
    debouncedListFetch,
  ]);

  useEffect(() => {
    return () => {
      debouncedListFetch.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedListFetch]);

  const majorCategoryOptions = useMemo(
    () => getDefaultMajorCategories(documents),
    [documents],
  );

  const minorCategoryOptions = useMemo(
    () => getMinorCategories(documents, filters.majorHead),
    [documents, filters.majorHead],
  );

  const filtersActive = hasActiveFilters(filters, searchQuery);

  function buildCurrentSearchRequestBody(start, length) {
    return buildSearchRequestBody({
      searchValue: searchQueryRef.current.trim(),
      majorHead: filtersRef.current.majorHead,
      minorHead: filtersRef.current.minorHead,
      tags: [
        filtersRef.current.tag1.trim(),
        filtersRef.current.tag2.trim(),
      ],
      fromDate: formatSearchDateForApi(filtersRef.current.fromDate),
      toDate: formatSearchDateForApi(filtersRef.current.toDate),
      start,
      length,
    });
  }

  async function handleDownloadAllZip() {
    if (isDownloadingZip || isLoading || totalCount === 0) {
      return;
    }

    setIsDownloadingZip(true);
    setDownloadNotice('');
    setDownloadNoticeType('success');
    setZipProgress({ completed: 0, total: totalCount });

    try {
      const result = await downloadSearchResultsAsZip({
        getRequestBody: buildCurrentSearchRequestBody,
        totalCount,
        zipFilename: `documents-${new Date().toISOString().slice(0, 10)}.zip`,
        onProgress: ({ completed, total, building }) => {
          setZipProgress({ completed, total, building });
        },
      });

      if (result.failedCount > 0) {
        setDownloadNoticeType('success');
        setDownloadNotice(
          `ZIP downloaded with ${result.downloadedCount} file(s). ${result.failedCount} file(s) could not be included.`,
        );
      } else {
        setDownloadNoticeType('success');
        setDownloadNotice(`ZIP downloaded with ${result.downloadedCount} file(s).`);
      }
    } catch (downloadError) {
      setDownloadNoticeType('error');
      setDownloadNotice(
        getApiErrorMessage(downloadError, 'Unable to download ZIP. Please try again.'),
      );
    } finally {
      setIsDownloadingZip(false);
      setZipProgress(null);
    }
  }

  function handleFilterChange(field, value) {
    setFilters((current) => {
      const next = { ...current, [field]: value };

      if (field === 'majorHead' && value !== current.majorHead) {
        next.minorHead = '';
      }

      return next;
    });
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

    debouncedListFetch.cancel();
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
          <button
            type="button"
            className={styles.outlineButton}
            disabled={isLoading || isDownloadingZip || totalCount === 0}
            onClick={handleDownloadAllZip}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {isDownloadingZip
              ? zipProgress?.building
                ? 'Building ZIP…'
                : zipProgress
                  ? `Downloading ${zipProgress.completed} of ${zipProgress.total}…`
                  : 'Preparing ZIP…'
              : 'Download All (ZIP)'}
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

      <DocumentSearch
        searchQuery={searchQuery}
        filters={filters}
        majorCategoryOptions={majorCategoryOptions}
        minorCategoryOptions={minorCategoryOptions}
        filtersActive={filtersActive}
        onSearchChange={setSearchQuery}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {apiError && (
        <p className={styles.apiNotice} role="alert">
          {apiError}
        </p>
      )}

      {downloadNotice && (
        <p
          className={
            downloadNoticeType === 'error'
              ? styles.apiNotice
              : styles.downloadNotice
          }
          role={downloadNoticeType === 'error' ? 'alert' : 'status'}
        >
          {downloadNotice}
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
