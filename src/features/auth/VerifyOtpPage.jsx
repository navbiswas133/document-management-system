import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyOtpSchema } from './verifyOtpSchema';
import styles from './VerifyOtpPage.module.css';

export function VerifyOtpPage() {
  const { state } = useLocation();
  const mobileNumber = state?.mobile_number;
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: '' },
  });

  function onSubmit() {
    if (isLoading) return;

    setIsLoading(true);
    // OTP verification API will be added in a later task.
    setIsLoading(false);
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

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}
