import { Link } from 'react-router-dom';
import styles from './DocumentList.module.css';

export function DocumentList({ documents = [] }) {
  if (documents.length === 0) {
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

  return (
    <section className={styles.section} aria-label="Documents list">
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
                      {doc.type && (
                        <span className={styles.docType}>{doc.type}</span>
                      )}
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
                    <Link
                      to={`/documents/${doc.id}`}
                      className={styles.actionLink}
                      aria-label={`View ${doc.name}`}
                    >
                      View
                    </Link>
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
    </section>
  );
}
