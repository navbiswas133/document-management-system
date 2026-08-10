import { useState } from 'react';
import { toast } from 'sonner';
import styles from './AdminUserCreationPage.module.css';

const EMPTY_FORM = {
  username: '',
  password: '',
};

function validateForm(form) {
  const errors = {};
  const trimmedUsername = form.username.trim();

  if (!trimmedUsername) {
    errors.username =
      form.username.length > 0
        ? 'Username cannot be only spaces.'
        : 'Username is required.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

function fieldClassName(baseClass, errorClass, hasError) {
  return hasError ? `${baseClass} ${errorClass}` : baseClass;
}

export function AdminUserCreationPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function handleFieldChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setForm(EMPTY_FORM);
    toast.success('User form validated. API integration coming soon.');
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderIcon} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
            <path
              d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>User management</h1>
      </header>

      <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
        <div className={styles.cardDecor} aria-hidden="true">
          <div className={styles.decorOrb} />
          <div className={styles.decorRing} />
        </div>

        <div className={styles.cardBody}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Create user</h2>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">
                <span className={styles.labelIcon} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M6 20c0-3.3 2.4-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
                Username <span className={styles.required}>*</span>
              </label>
              <div
                className={`${styles.inputWrap} ${styles.inputWrap_user} ${errors.username ? styles.inputWrapError : ''}`}
              >
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className={fieldClassName(
                    styles.input,
                    styles.inputError,
                    Boolean(errors.username),
                  )}
                  placeholder="Enter username"
                  value={form.username}
                  onChange={(event) =>
                    handleFieldChange('username', event.target.value)
                  }
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={
                    errors.username ? 'username-error' : undefined
                  }
                />
              </div>
              {errors.username && (
                <p id="username-error" className={styles.error}>
                  {errors.username}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                <span className={styles.labelIcon} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
                Password <span className={styles.required}>*</span>
              </label>
              <div
                className={`${styles.inputWrap} ${styles.inputWrap_lock} ${errors.password ? styles.inputWrapError : ''}`}
              >
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className={fieldClassName(
                    styles.input,
                    styles.inputError,
                    Boolean(errors.password),
                  )}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(event) =>
                    handleFieldChange('password', event.target.value)
                  }
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                />
              </div>
              {errors.password && (
                <p id="password-error" className={styles.error}>
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
            >
              Clear
            </button>
            <button type="submit" className={styles.submitButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Create user
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
