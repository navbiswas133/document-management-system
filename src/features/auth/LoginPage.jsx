import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { getApiErrorMessage } from '../../lib/apiResponse';
import { setCredentials } from '../../store/authSlice';
import { generateOTP, validateOTP } from './authApi';
import { loginSchema } from './loginSchema';
import { verifyOtpSchema } from './verifyOtpSchema';
import styles from './LoginPage.module.css';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

function formatCountdown(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
}

function emptyOtpDigits() {
  return Array.from({ length: OTP_LENGTH }, () => '');
}

function LoginBrand() {
  return (
    <header className={styles.brand}>
      <div className={styles.logo} aria-hidden="true" />
      <div className={styles.brandText}>
        <p className={styles.brandTitle}>DMS</p>
        <p className={styles.brandSubtitle}>Document Management System</p>
      </div>
    </header>
  );
}

function LoginHero() {
  return (
    <div className={styles.heroPanel} aria-hidden="true">
      <div className={styles.heroArt}>
        <div className={styles.heroCloud} />
        <div className={styles.heroShield} />
        <div className={styles.heroDocs} />
        <div className={styles.heroPlant} />
        <div className={styles.heroWave} />
      </div>
    </div>
  );
}

function OtpStep({
  mobileNumber,
  otpDigits,
  otpRefs,
  otpError,
  resendSeconds,
  isSendingOtp,
  isVerifying,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onVerify,
  onResend,
}) {
  const canResend = resendSeconds === 0;

  return (
    <section className={styles.otpSection} aria-labelledby="otp-heading">
      <p id="otp-heading" className={styles.otpLabel}>Enter OTP</p>
      <p className={styles.otpHint}>
        We sent a code to <strong>{mobileNumber}</strong>
      </p>

      <div className={styles.otpInputs} onPaste={onOtpPaste}>
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              otpRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={styles.otpInput}
            value={digit}
            placeholder="-"
            disabled={isVerifying}
            aria-label={`OTP digit ${index + 1}`}
            onChange={(event) => onOtpChange(index, event.target.value)}
            onKeyDown={(event) => onOtpKeyDown(index, event)}
          />
        ))}
      </div>

      {otpError && <p className={styles.error}>{otpError}</p>}

      <p className={styles.resendText}>
        {canResend
          ? 'You can resend OTP now.'
          : `Resend OTP in ${formatCountdown(resendSeconds)}`}
      </p>

      {canResend && (
        <button
          type="button"
          className={styles.resendButton}
          onClick={onResend}
          disabled={isSendingOtp}
        >
          Resend OTP
        </button>
      )}

      <button
        type="button"
        className={styles.secondaryButton}
        onClick={onVerify}
        disabled={isVerifying}
      >
        {isVerifying ? 'Verifying…' : 'Verify OTP'}
      </button>
    </section>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const otpRefs = useRef([]);

  const [mobileNumber, setMobileNumber] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(emptyOtpDigits());
  const [otpError, setOtpError] = useState('');
  const [apiError, setApiError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '' },
  });

  const mobileField = register('mobile');

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!showOtpStep || resendSeconds <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setResendSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [showOtpStep, resendSeconds]);

  function resetOtpStep() {
    setShowOtpStep(false);
    setOtpDigits(emptyOtpDigits());
    setOtpError('');
    setResendSeconds(0);
  }

  function handleMobileChange(event) {
    mobileField.onChange(event);

    if (showOtpStep) {
      resetOtpStep();
    }

    setApiError('');
  }

  async function sendOtpToMobile(mobile) {
    setApiError('');
    setOtpError('');
    setIsSendingOtp(true);

    try {
      await generateOTP(mobile);
      setMobileNumber(mobile);
      setOtpDigits(emptyOtpDigits());
      setShowOtpStep(true);
      setResendSeconds(RESEND_SECONDS);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch (error) {
      setApiError(
        getApiErrorMessage(error, 'Unable to send OTP. Please try again.'),
      );
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function onSendOtp({ mobile }) {
    if (!isSendingOtp) {
      await sendOtpToMobile(mobile);
    }
  }

  async function onResendOtp() {
    if (mobileNumber && resendSeconds === 0 && !isSendingOtp) {
      await sendOtpToMobile(mobileNumber);
    }
  }

  function onOtpChange(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;

    setOtpDigits(nextDigits);
    setOtpError('');
    setApiError('');

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function onOtpKeyDown(index, event) {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function onOtpPaste(event) {
    const pastedDigits = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);

    if (!pastedDigits) {
      return;
    }

    event.preventDefault();

    const nextDigits = emptyOtpDigits();
    pastedDigits.split('').forEach((digit, index) => {
      nextDigits[index] = digit;
    });

    setOtpDigits(nextDigits);
    setOtpError('');
    otpRefs.current[Math.min(pastedDigits.length, OTP_LENGTH - 1)]?.focus();
  }

  async function onVerifyOtp(event) {
    event.preventDefault();

    if (!showOtpStep || isVerifying) {
      return;
    }

    const otp = otpDigits.join('');
    const validation = verifyOtpSchema.safeParse({ otp });

    if (!validation.success) {
      setOtpError(validation.error.issues[0]?.message ?? 'OTP is required.');
      return;
    }

    setOtpError('');
    setApiError('');
    setIsVerifying(true);

    try {
      const authData = await validateOTP(mobileNumber, otp);
      dispatch(
        setCredentials({
          token: authData.token,
          user_id: authData.user_id,
          user_name: authData.user_name,
          roles: authData.roles ?? [],
        }),
      );
      navigate('/dashboard');
    } catch (error) {
      setApiError(
        getApiErrorMessage(error, 'Unable to verify OTP. Please try again.'),
      );
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.formPanel}>
          <LoginBrand />

          <div className={styles.signInSection}>
            <header className={styles.intro}>
              <h1 className={styles.tagline}>Secure. Organize. Access.</h1>
              <p className={styles.instruction} id="sign-in-hint">
                {showOtpStep
                  ? 'Enter the OTP sent to your mobile number'
                  : 'Enter your mobile number to continue'}
              </p>
            </header>

            {!showOtpStep && (
              <form
                className={styles.mobileForm}
                onSubmit={handleSubmit(onSendOtp)}
                noValidate
                aria-describedby="sign-in-hint"
              >
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="mobile">
                    Mobile Number
                  </label>
                  <input
                    id="mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Enter mobile number"
                    className={styles.phoneInput}
                    disabled={isSendingOtp}
                    name={mobileField.name}
                    ref={mobileField.ref}
                    onBlur={mobileField.onBlur}
                    onChange={handleMobileChange}
                    aria-invalid={Boolean(errors.mobile)}
                    aria-describedby={
                      errors.mobile
                        ? 'mobile-error mobile-hint'
                        : 'mobile-hint'
                    }
                  />
                  <p id="mobile-hint" className={styles.fieldHintMuted}>
                    We will send a one-time password to this number.
                  </p>
                  {errors.mobile && (
                    <p id="mobile-error" className={styles.error}>
                      {errors.mobile.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? 'Sending OTP…' : 'Send OTP'}
                </button>
              </form>
            )}

            {apiError && (
              <p className={styles.apiError} role="alert">{apiError}</p>
            )}
          </div>

          {showOtpStep && (
            <OtpStep
              mobileNumber={mobileNumber}
              otpDigits={otpDigits}
              otpRefs={otpRefs}
              otpError={otpError}
              resendSeconds={resendSeconds}
              isSendingOtp={isSendingOtp}
              isVerifying={isVerifying}
              onOtpChange={onOtpChange}
              onOtpKeyDown={onOtpKeyDown}
              onOtpPaste={onOtpPaste}
              onVerify={onVerifyOtp}
              onResend={onResendOtp}
            />
          )}

          <footer className={styles.termsFooter}>
            <p className={styles.terms}>
              By continuing, you agree to our{' '}
              <button type="button" className={styles.termsLink}>
                Terms &amp; Conditions
              </button>
            </p>
          </footer>
        </div>

        <LoginHero />
      </div>
    </div>
  );
}
