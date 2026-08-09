import { Link } from 'react-router-dom';
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

function EmptyState() {
  return (
    <div className={styles.emptyState} role="status">
      <div className={styles.emptyIcon} aria-hidden="true" />
      <p className={styles.emptyTitle}>No documents yet</p>
      <p className={styles.emptyDescription}>
        Upload your first document to start organizing and sharing files.
      </p>
      <Link to="/documents/upload" className={styles.emptyAction}>
        Upload a document
      </Link>
    </div>
  );
}

export function DocumentsPage() {
  const documents = PLACEHOLDER_DOCUMENTS;
  const hasDocuments = documents.length > 0;

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

      {hasDocuments ? (
        <section className={styles.tableSection} aria-label="Documents list">
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Document</th>
                  <th scope="col">Date</th>
                  <th scope="col">Tags</th>
                  <th scope="col">
                    <span className={styles.actionsHeader}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td data-label="Document">
                      <div className={styles.docInfo}>
                        <span className={styles.docIcon} aria-hidden="true" />
                        <div className={styles.docDetails}>
                          <span className={styles.docName}>{doc.name}</span>
                          <span className={styles.docType}>{doc.type}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Date">
                      <time className={styles.date}>{doc.uploadedAt}</time>
                    </td>
                    <td data-label="Tags">
                      <ul className={styles.tagList}>
                        {doc.tags.map((tag) => (
                          <li key={tag}>
                            <span className={styles.tag}>{tag}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td data-label="Actions">
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.actionButton}
                          aria-label={`View ${doc.name}`}
                          disabled
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className={styles.actionButton}
                          aria-label={`Download ${doc.name}`}
                          disabled
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.placeholderNote}>
            Showing placeholder data for visual development.
          </p>
        </section>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
