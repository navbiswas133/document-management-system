import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from './loginSchema';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '' },
  });

  function onSubmit() {
    setIsLoading(true);
    // API and OTP flow will be added in a later task.
    setIsLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>
            Enter your mobile number and we&apos;ll send you a one-time password.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="mobile">
              Mobile number
            </label>
            <input
              id="mobile"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. 9876543210"
              className={styles.input}
              disabled={isLoading}
              {...register('mobile')}
            />
            {errors.mobile && (
              <p className={styles.error}>{errors.mobile.message}</p>
            )}
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
