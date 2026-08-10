import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchDocumentById } from './documentsApi';
import {
  downloadDocument,
  getFileExtension,
  isImageFile,
  isPdfFile,
  openDocumentPreview,
} from './documentFileActions';
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

function DocumentPreview({ fileUrl, name }) {
  if (!fileUrl) {
    return null;
  }

  if (isImageFile(fileUrl)) {
    return (
      <div className={styles.previewFrame}>
        <img src={fileUrl} alt={`Preview of ${name}`} className={styles.previewImage} />
      </div>
    );
  }

  if (isPdfFile(fileUrl)) {
    return (
      <div className={styles.previewFrame}>
        <iframe
          src={fileUrl}
          title={`Preview of ${name}`}
          className={styles.previewEmbed}
        />
      </div>
    );
  }

  return (
    <p className={styles.previewFallback}>
      Preview is not available for this file type. Use View file or Download.
    </p>
  );
}

export function DocumentDetailsPage() {
  const { documentId } = useParams();
  const location = useLocation();
  const initialDocument = location.state?.document;
  const hasInitialDocument =
    initialDocument && String(initialDocument.id) === String(documentId);

  const [document, setDocument] = useState(
    hasInitialDocument ? initialDocument : null,
  );
  const [isLoading, setIsLoading] = useState(!hasInitialDocument);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasInitialDocument) {
      return undefined;
    }

    let isMounted = true;

    async function loadDocument() {
      setIsLoading(true);
      setError('');

      try {
        const loadedDocument = await fetchDocumentById(documentId);

        if (!isMounted) {
          return;
        }

        setDocument(loadedDocument);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setDocument(null);
        setError('load_failed');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [documentId, hasInitialDocument]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.statusText} role="status">Loading document…</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className={styles.page}>
        <section className={styles.notFound} role="status">
          <h1 className={styles.notFoundTitle}>Document not found</h1>
          <p className={styles.notFoundText}>
            This document could not be found.
          </p>
          <Link to="/documents" className={styles.notFoundAction}>
            Back to documents
          </Link>
        </section>
      </div>
    );
  }

  const fileUrl = document.file_url;
  const fileType = getFileExtension(fileUrl).toUpperCase() || 'File';
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
            <p className={styles.subtitle}>{fileType} document</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            disabled={!fileUrl}
            onClick={() => openDocumentPreview(fileUrl)}
          >
            View file
          </button>
          <button
            type="button"
            className={styles.actionButton}
            disabled={!fileUrl}
            onClick={() => downloadDocument(fileUrl, document.name)}
          >
            Download
          </button>
          <button type="button" className={styles.actionButton} disabled>
            Edit
          </button>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="document-preview-heading">
        <h2 id="document-preview-heading" className={styles.sectionTitle}>
          Preview
        </h2>
        <DocumentPreview fileUrl={fileUrl} name={document.name} />
      </section>

      <section className={styles.section} aria-labelledby="document-info-heading">
        <h2 id="document-info-heading" className={styles.sectionTitle}>
          Document information
        </h2>
        <dl className={styles.detailsList}>
          <DetailItem label="File name" value={document.name} />
          <DetailItem label="File type" value={fileType} />
          <DetailItem label="Document date" value={document.date} />
          <DetailItem label="Upload time" value={document.upload_time} />
          <DetailItem label="Major category" value={document.category} />
          <DetailItem label="Minor category" value={document.department} />
          <DetailItem label="Remarks" value={document.document_remarks} />
          <DetailItem label="Uploaded by" value={document.uploaded_by} />
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
    </article>
  );
}
