import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateOTP } from './authApi';
import { loginSchema } from './loginSchema';
import styles from './LoginPage.module.css';

function getErrorMessage(error) {
  const data = error.response?.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  return 'Unable to send OTP. Please try again.';
}

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '' },
  });

  async function onSubmit({ mobile }) {
    if (isLoading) return;

    setApiError('');
    setIsLoading(true);

    try {
      await generateOTP(mobile);
      navigate('/verify-otp', { state: { mobile_number: mobile } });
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
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

          {apiError && <p className={styles.error}>{apiError}</p>}

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
