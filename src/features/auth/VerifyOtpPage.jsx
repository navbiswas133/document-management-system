import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { validateOTP } from './authApi';
import { verifyOtpSchema } from './verifyOtpSchema';
import styles from './VerifyOtpPage.module.css';

function getErrorMessage(error) {
  const data = error.response?.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  return 'Unable to verify OTP. Please try again.';
}

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mobileNumber = state?.mobile_number;
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: '' },
  });

  async function onSubmit({ otp }) {
    if (isLoading) return;

    if (!mobileNumber) {
      setApiError('Mobile number is missing. Please sign in again.');
      return;
    }

    setApiError('');
    setIsLoading(true);

    try {
      await validateOTP(mobileNumber, otp);
      navigate('/dashboard');
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
          <h1 className={styles.title}>Verify OTP</h1>
          <p className={styles.subtitle}>
            {mobileNumber
              ? `Enter the one-time password sent to ${mobileNumber}.`
              : 'Enter the one-time password sent to your mobile number.'}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="otp">
              One-time password
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter OTP"
              className={`${styles.input} ${styles.otpInput}`}
              disabled={isLoading}
              {...register('otp')}
            />
            {errors.otp && (
              <p className={styles.error}>{errors.otp.message}</p>
            )}
          </div>

          {apiError && <p className={styles.error}>{apiError}</p>}

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}
