import { Link } from 'react-router-dom';
import { getFileTone, getTagTone } from './placeholderDocuments';
import {
  downloadDocument,
  openDocumentPreview,
} from './documentFileActions';
import styles from './DocumentList.module.css';

const MAX_VISIBLE_PAGES = 5;

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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
          <path d="M4 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : tone === 'pdf' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : tone === 'doc' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 4v4h4M10 13h8M10 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function getCategoryTone(category) {
  const normalized = String(category).trim().toLowerCase();

  if (normalized === 'personal') {
    return 'personal';
  }

  if (normalized === 'professional') {
    return 'professional';
  }

  if (normalized === 'company') {
    return 'company';
  }

  return 'default';
}

function CategoryBadge({ category }) {
  const tone = getCategoryTone(category);
  const className = `${styles.categoryBadge} ${styles[`categoryBadge_${tone}`]}`;

  return (
    <span className={className}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {tone === 'personal' ? (
          <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        ) : tone === 'professional' ? (
          <>
            <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="2" />
          </>
        ) : (
          <path d="M4 20V10l8-6 8 6v10H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        )}
      </svg>
      {category}
    </span>
  );
}

function DepartmentCell({ value }) {
  return (
    <span className={styles.departmentCell}>
      <span className={styles.departmentIcon} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M6 20c0-3.3 2.4-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      {value}
    </span>
  );
}

function DateCell({ value }) {
  return (
    <span className={styles.dateCell}>
      <span className={styles.dateIcon} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      {value ?? '—'}
    </span>
  );
}

function HeaderLabel({ icon, children }) {
  return (
    <span className={styles.headerLabel}>
      {icon}
      {children}
    </span>
  );
}

function ActionIcons({ documentId, name, fileUrl, document }) {
  const canAccessFile = Boolean(fileUrl);

  return (
    <div className={styles.actionIcons}>
      <button
        type="button"
        className={`${styles.iconAction} ${styles.iconAction_preview}`}
        aria-label={`Preview ${name}`}
        disabled={!canAccessFile}
        onClick={() => openDocumentPreview(fileUrl)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <Link
        to={`/documents/${documentId}`}
        state={{ document }}
        className={`${styles.iconAction} ${styles.iconAction_view}`}
        aria-label={`View details for ${name}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 3h7v7M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <button
        type="button"
        className={`${styles.iconAction} ${styles.iconAction_download}`}
        aria-label={`Download ${name}`}
        disabled={!canAccessFile}
        onClick={() => downloadDocument(fileUrl, name)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);
  start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function DocumentList({
  documents = [],
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
}) {
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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showingFrom = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, totalCount);
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={styles.resultsCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">
                <HeaderLabel
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  }
                >
                  File Name
                </HeaderLabel>
              </th>
              <th scope="col">
                <HeaderLabel
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  }
                >
                  Category
                </HeaderLabel>
              </th>
              <th scope="col">
                <HeaderLabel
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M6 20c0-3.3 2.4-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  }
                >
                  Name / Department
                </HeaderLabel>
              </th>
              <th scope="col">
                <HeaderLabel
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  }
                >
                  Date
                </HeaderLabel>
              </th>
              <th scope="col">
                <HeaderLabel
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M20 12l-8 8-4-4-6-6 8-8 6 6 4 4z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  }
                >
                  Tags
                </HeaderLabel>
              </th>
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
              const fileUrl = doc.file_url;

              return (
                <tr key={documentId} className={styles.tableRow}>
                  <td data-label="File Name" className={styles.fileNameTd}>
                    <div className={styles.fileNameCell}>
                      <FileIcon filename={name} />
                      <span className={styles.fileName}>{name}</span>
                    </div>
                  </td>
                  <td data-label="Category">
                    {category === '—' ? (
                      <span className={styles.mutedCell}>—</span>
                    ) : (
                      <CategoryBadge category={category} />
                    )}
                  </td>
                  <td data-label="Name / Department">
                    {department === '—' ? (
                      <span className={styles.mutedCell}>—</span>
                    ) : (
                      <DepartmentCell value={department} />
                    )}
                  </td>
                  <td data-label="Date">
                    <DateCell value={date} />
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
                    <ActionIcons
                      documentId={documentId}
                      name={name}
                      fileUrl={fileUrl}
                      document={doc}
                    />
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
          <button
            type="button"
            className={styles.pageButton}
            disabled={!canGoPrevious}
            aria-label="Previous page"
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {visiblePages.map((page) => {
            const isActive = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                className={isActive ? `${styles.pageNumber} ${styles.pageNumberActive}` : styles.pageNumber}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
                disabled={isActive}
                onClick={() => onPageChange?.(page)}
              >
                {page}
              </button>
            );
          })}
          <button
            type="button"
            className={styles.pageButton}
            disabled={!canGoNext}
            aria-label="Next page"
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </footer>
    </div>
  );
}
