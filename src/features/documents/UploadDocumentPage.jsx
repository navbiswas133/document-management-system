import { useRef, useState } from 'react';
import styles from './UploadDocumentPage.module.css';

const MAJOR_HEAD_OPTIONS = ['Personal', 'Professional'];
const MINOR_HEAD_OPTIONS = ['John', 'IT', 'Accounts', 'Legal'];
const TAG_OPTIONS = ['important', 'identity', 'personal', 'invoice', 'project', 'tax'];

const DEFAULT_FORM = {
  majorHead: 'Personal',
  minorHead: 'John',
  documentDate: '2024-05-16',
  remarks: 'Passport copy for verification.',
  tags: ['important', 'identity', 'personal'],
};

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileKind(file) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    return 'pdf';
  }

  if (file.type.startsWith('image/')) {
    return 'image';
  }

  return 'file';
}

function FileKindIcon({ kind }) {
  const className = `${styles.fileKindIcon} ${styles[`fileKindIcon_${kind}`]}`;

  return (
    <div className={className} aria-hidden="true">
      {kind === 'image' ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
          <path d="M4 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function validateForm(form, file) {
  const errors = {};

  if (!file) {
    errors.file = 'Please select a file to upload.';
  } else if (
    !ACCEPTED_FILE_TYPES.includes(file.type) &&
    !file.name.match(/\.(pdf|jpg|jpeg|png|webp)$/i)
  ) {
    errors.file = 'Only PDF and image files are allowed.';
  } else if (file.size > MAX_FILE_SIZE) {
    errors.file = 'File must be 10MB or smaller.';
  }

  if (!form.majorHead.trim()) {
    errors.majorHead = 'Category is required.';
  }

  if (!form.minorHead.trim()) {
    errors.minorHead = 'Name is required.';
  }

  if (!form.documentDate) {
    errors.documentDate = 'Date is required.';
  }

  return errors;
}

function fieldClassName(baseClass, errorClass, hasError) {
  return hasError ? `${baseClass} ${errorClass}` : baseClass;
}

export function UploadDocumentPage() {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [validationNote, setValidationNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

  function handleAddTag(tag) {
    if (!tag || form.tags.includes(tag)) return;

    setForm((current) => ({
      ...current,
      tags: [...current.tags, tag],
    }));
    setValidationNote('');
  }

  function handleRemoveTag(tag) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((item) => item !== tag),
    }));
  }

  function assignFile(selectedFile) {
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

  function handleFileChange(event) {
    assignFile(event.target.files?.[0] ?? null);
  }

  function handleBrowseClick() {
    fileInputRef.current?.click();
  }

  function handleRemoveFile() {
    setFile(null);
    setValidationNote('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (errors.file) {
      setErrors((current) => {
        const next = { ...current };
        delete next.file;
        return next;
      });
    }
  }

  function handleDropzoneClick() {
    if (!file) {
      handleBrowseClick();
    }
  }

  function handleDropzoneKeyDown(event) {
    if (!file && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleBrowseClick();
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    assignFile(event.dataTransfer.files?.[0] ?? null);
  }

  function handleClear() {
    setForm({ ...DEFAULT_FORM, tags: [...DEFAULT_FORM.tags] });
    setFile(null);
    setErrors({});
    setValidationNote('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const availableTags = TAG_OPTIONS.filter((tag) => !form.tags.includes(tag));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Upload Document</h1>
        <p className={styles.subtitle}>Add a new document to the system</p>
      </header>

      <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="document-date">
              Date <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
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
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            {errors.documentDate && (
              <p id="document-date-error" className={styles.error}>
                {errors.documentDate}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="major-head">
              Category (Major Head) <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrap}>
              <select
                id="major-head"
                name="majorHead"
                className={fieldClassName(styles.select, styles.fieldError, Boolean(errors.majorHead))}
                value={form.majorHead}
                onChange={(event) =>
                  handleFieldChange('majorHead', event.target.value)
                }
                aria-invalid={Boolean(errors.majorHead)}
                aria-describedby={
                  errors.majorHead ? 'major-head-error' : undefined
                }
              >
                {MAJOR_HEAD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            {errors.majorHead && (
              <p id="major-head-error" className={styles.error}>
                {errors.majorHead}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="minor-head">
              Name (Minor Head) <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrap}>
              <select
                id="minor-head"
                name="minorHead"
                className={fieldClassName(styles.select, styles.fieldError, Boolean(errors.minorHead))}
                value={form.minorHead}
                onChange={(event) =>
                  handleFieldChange('minorHead', event.target.value)
                }
                aria-invalid={Boolean(errors.minorHead)}
                aria-describedby={
                  errors.minorHead ? 'minor-head-error' : undefined
                }
              >
                {MINOR_HEAD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            {errors.minorHead && (
              <p id="minor-head-error" className={styles.error}>
                {errors.minorHead}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="tag-add">
              Tags
            </label>
            <div className={styles.tagsField}>
              <div className={styles.tagList}>
                {form.tags.map((tag) => (
                  <span key={tag} className={styles.tagChip}>
                    {tag}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              {availableTags.length > 0 && (
                <div className={styles.selectWrap}>
                  <select
                    id="tag-add"
                    className={styles.select}
                    defaultValue=""
                    onChange={(event) => {
                      handleAddTag(event.target.value);
                      event.target.value = '';
                    }}
                    aria-label="Add tag"
                  >
                    <option value=""> </option>
                    {availableTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>
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
            value={form.remarks}
            onChange={(event) =>
              handleFieldChange('remarks', event.target.value)
            }
          />
        </div>

        <div className={styles.fileSection}>
          <label className={styles.label} htmlFor="document-file">
            Select File <span className={styles.required}>*</span>
          </label>

          <div
            className={`${styles.dropzone} ${file ? styles.dropzoneHasFile : ''} ${isDragging ? styles.dropzoneActive : ''} ${errors.file ? styles.dropzoneError : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropzoneClick}
            onKeyDown={handleDropzoneKeyDown}
            role={file ? undefined : 'button'}
            tabIndex={file ? undefined : 0}
            aria-label={file ? undefined : 'Browse or drag and drop a file'}
          >
            {file ? (
              <div className={styles.filePreview}>
                <FileKindIcon kind={getFileKind(file)} />
                <div className={styles.filePreviewInfo}>
                  <p className={styles.filePreviewName}>{file.name}</p>
                  <p className={styles.filePreviewMeta}>
                    {file.type || 'Unknown type'} · {formatFileSize(file.size)}
                  </p>
                </div>
                <div className={styles.filePreviewActions}>
                  <button
                    type="button"
                    className={styles.fileActionButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleBrowseClick();
                    }}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className={styles.fileActionButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.dropzoneIconWrap}>
                  <svg className={styles.dropzoneIcon} width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 15V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8.5 10.5L12 7l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 18a2 2 0 002 2h10a2 2 0 002-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 6a4 4 0 018 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p className={styles.dropzoneTitle}>Drag &amp; drop file here</p>
                <p className={styles.dropzoneText}>or click to browse from your device</p>
                <button
                  type="button"
                  className={styles.browseButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleBrowseClick();
                  }}
                >
                  Browse File
                </button>
              </>
            )}

            <input
              id="document-file"
              ref={fileInputRef}
              name="file"
              type="file"
              className={styles.hiddenFileInput}
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
              onChange={handleFileChange}
              aria-invalid={Boolean(errors.file)}
              aria-describedby={errors.file ? 'document-file-error' : 'file-hint'}
            />
          </div>

          <div className={styles.fileMeta}>
            <p id="file-hint" className={styles.fileHint}>
              Only PDF and Image files are allowed (Max 10MB)
            </p>
            <div className={styles.fileTypes} aria-hidden="true">
              <span className={styles.fileTypeBadge}>PDF</span>
              <span className={styles.fileTypeBadge}>JPG</span>
              <span className={styles.fileTypeBadge}>PNG</span>
            </div>
          </div>

          {errors.file && (
            <p id="document-file-error" className={styles.error}>
              {errors.file}
            </p>
          )}
        </div>

        {validationNote && (
          <p className={styles.validationNote} role="status">
            {validationNote}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.clearButton} onClick={handleClear}>
            Clear
          </button>
          <button type="submit" className={styles.uploadButton}>
            Upload
          </button>
        </div>
      </form>
    </div>
  );
}
