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

function filterDocuments(documents, query) {
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

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedQuery = searchQuery.trim();
  const filteredDocuments = filterDocuments(PLACEHOLDER_DOCUMENTS, searchQuery);
  const hasSearchQuery = trimmedQuery.length > 0;
  const hasNoSearchResults = hasSearchQuery && filteredDocuments.length === 0;

  function handleClearSearch() {
    setSearchQuery('');
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
        <button type="button" className={styles.filterButton} disabled>
          <span className={styles.filterIcon} aria-hidden="true" />
          Filters
        </button>
      </section>

      <div className={styles.listArea}>
        {hasNoSearchResults ? (
          <div className={styles.noResults} role="status">
            <p className={styles.noResultsTitle}>No matching documents</p>
            <p className={styles.noResultsText}>
              Nothing matches &ldquo;{trimmedQuery}&rdquo;. Try a different name,
              type, or tag.
            </p>
            <button
              type="button"
              className={styles.noResultsAction}
              onClick={handleClearSearch}
            >
              Clear search
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
