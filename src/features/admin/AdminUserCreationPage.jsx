import { useState } from 'react';
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
  const [successMessage, setSuccessMessage] = useState('');

  function handleFieldChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccessMessage('');

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    setSuccessMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setForm(EMPTY_FORM);
    setSuccessMessage(
      'Form validation passed. User creation is not connected to the API yet.',
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin</h1>
        <p className={styles.description}>
          Create a new user account. This form is for UI demonstration only.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section
          className={styles.section}
          aria-labelledby="create-user-heading"
        >
          <h2 id="create-user-heading" className={styles.sectionTitle}>
            Create user
          </h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className={fieldClassName(
                styles.input,
                styles.fieldError,
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
            {errors.username && (
              <p id="username-error" className={styles.error}>
                {errors.username}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={fieldClassName(
                styles.input,
                styles.fieldError,
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
            {errors.password && (
              <p id="password-error" className={styles.error}>
                {errors.password}
              </p>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Create user
          </button>
        </section>

        {successMessage && (
          <p
            className={styles.successMessage}
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
}
