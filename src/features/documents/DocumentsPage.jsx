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

export function DocumentsPage() {
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
            disabled
          />
        </div>
        <button type="button" className={styles.filterButton} disabled>
          <span className={styles.filterIcon} aria-hidden="true" />
          Filters
        </button>
      </section>

      <div className={styles.listArea}>
        <DocumentList documents={PLACEHOLDER_DOCUMENTS} />
        {PLACEHOLDER_DOCUMENTS.length > 0 && (
          <p className={styles.placeholderNote}>
            Showing placeholder data for visual development.
          </p>
        )}
      </div>
    </div>
  );
}
