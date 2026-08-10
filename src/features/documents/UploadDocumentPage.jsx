import { useRef, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage, getResponseSuccessMessage } from '../../lib/apiResponse';
import { fetchDocumentTags, saveDocumentEntry } from './documentsApi';
import { formatDateForApi } from './searchFilters';
import {
  getDefaultMinorHead,
  getMinorHeadLabel,
  getMinorHeadOptions,
  MAJOR_HEAD_OPTIONS,
} from './uploadCategories';
import styles from './UploadDocumentPage.module.css';

const ALLOWED_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);
const ALLOWED_FILE_EXTENSION = /\.(pdf|jpe?g|png)$/i;
const FILE_INPUT_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isAllowedUploadFile(file) {
  if (!file) {
    return false;
  }

  const mimeType = file.type.toLowerCase();

  if (ALLOWED_FILE_MIME_TYPES.has(mimeType)) {
    return true;
  }

  return ALLOWED_FILE_EXTENSION.test(file.name);
}

function getUploadFileError(file) {
  if (!file) {
    return 'Please select a file to upload.';
  }

  if (!isAllowedUploadFile(file)) {
    return 'Only PDF and image files (JPG, PNG) are allowed.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'File must be 10MB or smaller.';
  }

  return '';
}

const EMPTY_FORM = {
  majorHead: 'Personal',
  minorHead: getDefaultMinorHead('Personal'),
  documentDate: '',
  remarks: '',
  tags: [],
};

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileKind(file) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    return 'pdf';
  }

  if (
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    /\.(jpe?g|png)$/i.test(file.name)
  ) {
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

  const fileError = getUploadFileError(file);

  if (fileError) {
    errors.file = fileError;
  }

  if (!form.majorHead.trim()) {
    errors.majorHead = 'Category is required.';
  }

  if (!form.minorHead.trim()) {
    errors.minorHead = `${getMinorHeadLabel(form.majorHead)} is required.`;
  }

  if (!form.documentDate) {
    errors.documentDate = 'Date is required.';
  }

  if (form.tags.length === 0) {
    errors.tags = 'Please enter atleast 1 File Tag Name.';
  }

  return errors;
}

function fieldClassName(baseClass, errorClass, hasError) {
  return hasError ? `${baseClass} ${errorClass}` : baseClass;
}

export function UploadDocumentPage() {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user_id);

  const fileInputRef = useRef(null);
  const tagInputRef = useRef(null);
  const tagFieldRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [existingTags, setExistingTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [showTagList, setShowTagList] = useState(false);

  const minorHeadOptions = getMinorHeadOptions(form.majorHead);
  const minorHeadLabel = getMinorHeadLabel(form.majorHead);

  async function loadDocumentTags(term = '') {
    setIsLoadingTags(true);

    try {
      const tags = await fetchDocumentTags(term);
      setExistingTags(tags);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load tags.'));
    } finally {
      setIsLoadingTags(false);
    }
  }

  const tagListOptions = useMemo(() => {
    const query = tagInput.trim().toLowerCase();

    return existingTags.filter((tag) => {
      if (form.tags.includes(tag)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return tag.toLowerCase().includes(query);
    });
  }, [existingTags, form.tags, tagInput]);

  function handleTagFieldFocus() {
    setShowTagList(true);
    loadDocumentTags(tagInput.trim());
  }

  function handleTagFieldBlur(event) {
    if (tagFieldRef.current?.contains(event.relatedTarget)) {
      return;
    }

    setShowTagList(false);
  }

  function handleSelectTag(tag) {
    handleAddTag(tag);
    tagInputRef.current?.focus();
  }

  function handleFieldChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatusMessage('');
    setStatusType('');

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function handleMajorHeadChange(value) {
    setForm((current) => ({
      ...current,
      majorHead: value,
      minorHead: getDefaultMinorHead(value),
    }));
    setStatusMessage('');
    setStatusType('');

    if (errors.majorHead || errors.minorHead) {
      setErrors((current) => {
        const next = { ...current };
        delete next.majorHead;
        delete next.minorHead;
        return next;
      });
    }
  }

  function handleAddTag(tag) {
    const normalizedTag = tag.trim();

    if (!normalizedTag || form.tags.includes(normalizedTag)) {
      return;
    }

    setForm((current) => ({
      ...current,
      tags: [...current.tags, normalizedTag],
    }));
    setTagInput('');
    setStatusMessage('');
    setStatusType('');

    if (errors.tags) {
      setErrors((current) => {
        const next = { ...current };
        delete next.tags;
        return next;
      });
    }
  }

  function handleRemoveTag(tag) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((item) => item !== tag),
    }));
  }

  function handleTagInputKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTag(tagInput);
    }

    if (event.key === 'Escape') {
      setShowTagList(false);
    }
  }

  function assignFile(selectedFile) {
    if (!selectedFile) {
      setFile(null);
      setStatusMessage('');
      setStatusType('');

      if (errors.file) {
        setErrors((current) => {
          const next = { ...current };
          delete next.file;
          return next;
        });
      }

      return;
    }

    const fileError = getUploadFileError(selectedFile);

    if (fileError) {
      setFile(null);
      setStatusMessage('');
      setStatusType('');
      setErrors((current) => ({ ...current, file: fileError }));

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    setFile(selectedFile);
    setStatusMessage('');
    setStatusType('');

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
    setStatusMessage('');
    setStatusType('');

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
    setForm({
      ...EMPTY_FORM,
      minorHead: getDefaultMinorHead(EMPTY_FORM.majorHead),
      tags: [],
    });
    setFile(null);
    setErrors({});
    setStatusMessage('');
    setStatusType('');
    setTagInput('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function resetFormAfterSuccess() {
    setForm({
      ...EMPTY_FORM,
      minorHead: getDefaultMinorHead(EMPTY_FORM.majorHead),
      tags: [],
    });
    setFile(null);
    setErrors({});
    setTagInput('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form, file);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!userId) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    setIsUploading(true);

    try {
      const response = await saveDocumentEntry({
        file,
        majorHead: form.majorHead,
        minorHead: form.minorHead,
        documentDate: formatDateForApi(form.documentDate),
        remarks: form.remarks.trim(),
        tags: form.tags,
        userId,
      });

      resetFormAfterSuccess();
      toast.success(
        getResponseSuccessMessage(response, 'Document uploaded successfully'),
      );
      navigate('/documents');
    } catch (uploadError) {
      toast.error(
        getApiErrorMessage(uploadError, 'Unable to upload document. Please try again.'),
      );
    } finally {
      setIsUploading(false);
    }
  }

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
                disabled={isUploading}
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
              Category <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrap}>
              <select
                id="major-head"
                name="majorHead"
                className={fieldClassName(styles.select, styles.fieldError, Boolean(errors.majorHead))}
                value={form.majorHead}
                onChange={(event) => handleMajorHeadChange(event.target.value)}
                disabled={isUploading}
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
              {minorHeadLabel} <span className={styles.required}>*</span>
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
                disabled={isUploading}
                aria-invalid={Boolean(errors.minorHead)}
                aria-describedby={
                  errors.minorHead ? 'minor-head-error' : undefined
                }
              >
                {minorHeadOptions.map((option) => (
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
            <label className={styles.label} htmlFor="tag-input">
              Tags <span className={styles.required}>*</span>
            </label>

            <div className={styles.tagFieldWrap} ref={tagFieldRef}>
              <div
                className={fieldClassName(
                  styles.tagsField,
                  styles.tagsFieldError,
                  Boolean(errors.tags),
                )}
                onClick={() => tagInputRef.current?.focus()}
              >
                {form.tags.map((tag) => (
                  <span key={tag} className={styles.tagChip}>
                    {tag}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveTag(tag);
                      }}
                      disabled={isUploading}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  id="tag-input"
                  ref={tagInputRef}
                  type="text"
                  className={styles.tagInput}
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onFocus={handleTagFieldFocus}
                  onBlur={handleTagFieldBlur}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Click to select or type a tag"
                  disabled={isUploading}
                  aria-invalid={Boolean(errors.tags)}
                  aria-expanded={showTagList}
                  aria-haspopup="listbox"
                  aria-describedby={errors.tags ? 'tags-error' : undefined}
                />
              </div>

              {showTagList && (
                <ul className={styles.tagDropdownList} role="listbox" aria-label="Tag suggestions">
                  {isLoadingTags && (
                    <li className={styles.tagDropdownEmpty}>Loading tags…</li>
                  )}
                  {!isLoadingTags && tagListOptions.length === 0 && (
                    <li className={styles.tagDropdownEmpty}>
                      {tagInput.trim()
                        ? 'No matching tags. Press Enter to add.'
                        : 'No tags available. Type and press Enter.'}
                    </li>
                  )}
                  {!isLoadingTags &&
                    tagListOptions.map((tag) => (
                      <li key={tag}>
                        <button
                          type="button"
                          className={styles.tagDropdownOption}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectTag(tag)}
                          disabled={isUploading}
                          role="option"
                        >
                          {tag}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {errors.tags && (
              <p id="tags-error" className={styles.error}>
                {errors.tags}
              </p>
            )}
            <p className={styles.fieldHint}>
              Click the field to load tags, pick from the list, or type a new tag and press Enter.
            </p>
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
            disabled={isUploading}
            placeholder="Optional remarks"
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
                    disabled={isUploading}
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
                    disabled={isUploading}
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
                  disabled={isUploading}
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
              accept={FILE_INPUT_ACCEPT}
              onChange={handleFileChange}
              disabled={isUploading}
              aria-invalid={Boolean(errors.file)}
              aria-describedby={errors.file ? 'document-file-error' : 'file-hint'}
            />
          </div>

          <div className={styles.fileMeta}>
            <p id="file-hint" className={styles.fileHint}>
              Only PDF and image files are allowed (JPG, PNG — max 10MB)
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

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            disabled={isUploading}
          >
            Clear
          </button>
          <button
            type="submit"
            className={styles.uploadButton}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  );
}
