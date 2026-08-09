import { Link } from 'react-router-dom';
import { getFileTone, getTagTone } from './placeholderDocuments';
import styles from './DocumentList.module.css';

const PAGE_SIZE = 5;
const TOTAL_PAGES = 5;

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => (typeof tag === 'string' ? tag : tag?.tag_name))
    .filter(Boolean);
}

function FileIcon({ filename }) {
  const tone = getFileTone(filename);
  const className = `${styles.fileIcon} ${styles[`fileIcon_${tone}`]}`;

  return (
    <div className={className} aria-hidden="true">
      {tone === 'image' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
          <path d="M4 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function ActionIcons({ documentId, name }) {
  return (
    <div className={styles.actionIcons}>
      <Link
        to={`/documents/${documentId}`}
        className={styles.iconAction}
        aria-label={`View ${name}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </Link>
      <button
        type="button"
        className={styles.iconAction}
        aria-label={`Download ${name}`}
        disabled
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.iconAction}
        aria-label={`More actions for ${name}`}
        disabled
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="18" r="1.5" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}

export function DocumentList({ documents = [], totalCount = 0 }) {
  if (documents.length === 0) {
    return (
      <div className={styles.emptyState} role="status">
        <p className={styles.emptyTitle}>No documents found</p>
        <p className={styles.emptyDescription}>
          Try adjusting your search or upload a new document.
        </p>
        <Link to="/documents/upload" className={styles.emptyAction}>
          Upload a document
        </Link>
      </div>
    );
  }

  const showingFrom = 1;
  const showingTo = documents.length;

  return (
    <div className={styles.resultsCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">File Name</th>
              <th scope="col">Category</th>
              <th scope="col">Name / Department</th>
              <th scope="col">Date</th>
              <th scope="col">Tags</th>
              <th scope="col">
                <span className={styles.actionsHeader}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => {
              const date = doc.date ?? doc.uploadedAt;
              const department = doc.department ?? doc.type ?? '—';
              const category = doc.category ?? '—';
              const name = doc.name ?? '—';
              const tags = normalizeTags(doc.tags);
              const documentId = doc.id ?? `document-${index}`;

              return (
                <tr key={documentId}>
                  <td data-label="File Name">
                    <div className={styles.fileNameCell}>
                      <FileIcon filename={name} />
                      <span className={styles.fileName}>{name}</span>
                    </div>
                  </td>
                  <td data-label="Category" className={styles.mutedCell}>
                    {category}
                  </td>
                  <td data-label="Name / Department" className={styles.mutedCell}>
                    {department}
                  </td>
                  <td data-label="Date" className={styles.mutedCell}>
                    {date ?? '—'}
                  </td>
                  <td data-label="Tags">
                    {tags.length === 0 ? (
                      <span className={styles.mutedCell}>—</span>
                    ) : (
                      <ul className={styles.tagList}>
                        {tags.map((tag) => (
                          <li key={tag}>
                            <span
                              className={`${styles.tag} ${styles[`tag_${getTagTone(tag)}`]}`}
                            >
                              {tag}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td data-label="Actions">
                    <ActionIcons documentId={documentId} name={name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className={styles.tableFooter}>
        <p className={styles.footerText}>
          Showing {showingFrom} to {showingTo} of {totalCount} results
        </p>
        <nav className={styles.pagination} aria-label="Search results pagination">
          <button type="button" className={styles.pageButton} disabled aria-label="Previous page">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {Array.from({ length: TOTAL_PAGES }, (_, index) => {
            const page = index + 1;
            const isActive = page === 1;

            return (
              <button
                key={page}
                type="button"
                className={isActive ? `${styles.pageNumber} ${styles.pageNumberActive}` : styles.pageNumber}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
                disabled={isActive}
              >
                {page}
              </button>
            );
          })}
          <button type="button" className={styles.pageButton} aria-label="Next page">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </footer>
    </div>
  );
}
