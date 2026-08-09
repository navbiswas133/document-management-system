import { Link, useParams } from 'react-router-dom';
import { PLACEHOLDER_DOCUMENTS } from './placeholderDocuments';
import styles from './DocumentDetailsPage.module.css';

function formatDetailValue(value) {
  if (value === null || value === undefined) {
    return 'Not provided';
  }

  if (typeof value === 'string' && value.trim() === '') {
    return 'Not provided';
  }

  return value;
}

function DetailItem({ label, value }) {
  return (
    <div className={styles.detailItem}>
      <dt className={styles.detailLabel}>{label}</dt>
      <dd className={styles.detailValue}>{formatDetailValue(value)}</dd>
    </div>
  );
}

export function DocumentDetailsPage() {
  const { documentId } = useParams();
  const document = PLACEHOLDER_DOCUMENTS.find((doc) => doc.id === documentId);

  if (!document) {
    return (
      <div className={styles.page}>
        <Link to="/documents" className={styles.backLink}>
          Back to documents
        </Link>
        <section className={styles.notFound} role="status">
          <h1 className={styles.notFoundTitle}>Document not found</h1>
          <p className={styles.notFoundText}>
            This document could not be found in the placeholder data.
          </p>
        </section>
      </div>
    );
  }

  const hasTags = document.tags?.length > 0;

  return (
    <article className={styles.page}>
      <Link to="/documents" className={styles.backLink}>
        Back to documents
      </Link>

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <span className={styles.docIcon} aria-hidden="true" />
          <div className={styles.headerText}>
            <h1 className={styles.title}>{document.name}</h1>
            <p className={styles.subtitle}>{document.type} document</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.actionButton} disabled>
            View file
          </button>
          <button type="button" className={styles.actionButton} disabled>
            Download
          </button>
          <button type="button" className={styles.actionButton} disabled>
            Edit
          </button>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="document-info-heading">
        <h2 id="document-info-heading" className={styles.sectionTitle}>
          Document information
        </h2>
        <dl className={styles.detailsList}>
          <DetailItem label="File name" value={document.name} />
          <DetailItem label="File type" value={document.type} />
          <DetailItem label="Upload date" value={document.uploadedAt} />
          <DetailItem label="Major category" value={document.majorHead} />
          <DetailItem label="Minor category" value={document.minorHead} />
          <DetailItem label="Remarks" value={document.remarks} />
          <DetailItem label="Uploaded by" value={document.uploadedBy} />
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="document-tags-heading">
        <h2 id="document-tags-heading" className={styles.sectionTitle}>
          Tags
        </h2>
        {hasTags ? (
          <ul className={styles.tagList}>
            {document.tags.map((tag) => (
              <li key={tag}>
                <span className={styles.tag}>{tag}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyValue}>No tags</p>
        )}
      </section>

      <p className={styles.placeholderNote}>
        Showing placeholder data for visual development.
      </p>
    </article>
  );
}
