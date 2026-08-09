import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './UploadDocumentPage.module.css';

const EMPTY_FORM = {
  majorHead: '',
  minorHead: '',
  documentDate: '',
  remarks: '',
  tags: '',
};

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateForm(form, file) {
  const errors = {};

  if (!file) {
    errors.file = 'Please select a file to upload.';
  }

  if (!form.majorHead.trim()) {
    errors.majorHead = 'Major category is required.';
  }

  if (!form.minorHead.trim()) {
    errors.minorHead = 'Minor category is required.';
  }

  if (!form.documentDate) {
    errors.documentDate = 'Document date is required.';
  }

  return errors;
}

function fieldClassName(baseClass, errorClass, hasError) {
  return hasError ? `${baseClass} ${errorClass}` : baseClass;
}

export function UploadDocumentPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [validationNote, setValidationNote] = useState('');

  function handleFieldChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationNote('');

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setValidationNote('');

    if (errors.file) {
      setErrors((current) => {
        const next = { ...current };
        delete next.file;
        return next;
      });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form, file);
    setErrors(nextErrors);
    setValidationNote('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setValidationNote(
      'Form validation passed. Upload is not connected to the API yet.',
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Upload Document</h1>
          <p className={styles.description}>
            Add a new file with category, date, remarks, and tags. Upload will
            be enabled when the API is connected.
          </p>
        </div>
        <Link to="/documents" className={styles.backLink}>
          Back to documents
        </Link>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.section} aria-labelledby="file-section-heading">
          <h2 id="file-section-heading" className={styles.sectionTitle}>
            File
          </h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="document-file">
              Document file
            </label>
            <input
              id="document-file"
              name="file"
              type="file"
              className={fieldClassName(styles.fileInput, styles.fieldError, Boolean(errors.file))}
              onChange={handleFileChange}
              aria-invalid={Boolean(errors.file)}
              aria-describedby={errors.file ? 'document-file-error' : undefined}
            />
            {errors.file && (
              <p id="document-file-error" className={styles.error}>
                {errors.file}
              </p>
            )}
          </div>

          {file && (
            <div className={styles.fileInfo} role="status">
              <p className={styles.fileInfoLabel}>Selected file</p>
              <p className={styles.fileInfoName}>{file.name}</p>
              <p className={styles.fileInfoMeta}>
                {file.type || 'Unknown type'} · {formatFileSize(file.size)}
              </p>
            </div>
          )}
        </section>

        <section className={styles.section} aria-labelledby="details-section-heading">
          <h2 id="details-section-heading" className={styles.sectionTitle}>
            Document details
          </h2>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="major-head">
                Major category
              </label>
              <input
                id="major-head"
                name="majorHead"
                type="text"
                className={fieldClassName(styles.input, styles.fieldError, Boolean(errors.majorHead))}
                placeholder="e.g. Company"
                value={form.majorHead}
                onChange={(event) =>
                  handleFieldChange('majorHead', event.target.value)
                }
                aria-invalid={Boolean(errors.majorHead)}
                aria-describedby={
                  errors.majorHead ? 'major-head-error' : undefined
                }
              />
              {errors.majorHead && (
                <p id="major-head-error" className={styles.error}>
                  {errors.majorHead}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="minor-head">
                Minor category
              </label>
              <input
                id="minor-head"
                name="minorHead"
                type="text"
                className={fieldClassName(styles.input, styles.fieldError, Boolean(errors.minorHead))}
                placeholder="e.g. Work Order"
                value={form.minorHead}
                onChange={(event) =>
                  handleFieldChange('minorHead', event.target.value)
                }
                aria-invalid={Boolean(errors.minorHead)}
                aria-describedby={
                  errors.minorHead ? 'minor-head-error' : undefined
                }
              />
              {errors.minorHead && (
                <p id="minor-head-error" className={styles.error}>
                  {errors.minorHead}
                </p>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="document-date">
              Document date
            </label>
            <input
              id="document-date"
              name="documentDate"
              type="date"
              className={fieldClassName(styles.input, styles.fieldError, Boolean(errors.documentDate))}
              value={form.documentDate}
              onChange={(event) =>
                handleFieldChange('documentDate', event.target.value)
              }
              aria-invalid={Boolean(errors.documentDate)}
              aria-describedby={
                errors.documentDate ? 'document-date-error' : undefined
              }
            />
            {errors.documentDate && (
              <p id="document-date-error" className={styles.error}>
                {errors.documentDate}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="remarks">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              className={styles.textarea}
              rows={4}
              placeholder="Optional notes about this document"
              value={form.remarks}
              onChange={(event) =>
                handleFieldChange('remarks', event.target.value)
              }
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="tags">
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              className={styles.input}
              placeholder="e.g. finance, annual, 2024"
              value={form.tags}
              onChange={(event) =>
                handleFieldChange('tags', event.target.value)
              }
            />
            <p className={styles.hint}>
              Separate multiple tags with commas.
            </p>
          </div>
        </section>

        {validationNote && (
          <p className={styles.validationNote} role="status">
            {validationNote}
          </p>
        )}

        <div className={styles.actions}>
          <Link to="/documents" className={styles.cancelButton}>
            Cancel
          </Link>
          <button type="submit" className={styles.submitButton}>
            Upload document
          </button>
        </div>
      </form>
    </div>
  );
}
