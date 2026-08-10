import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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

function FolderLogoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoginBrand() {
  return (
    <header className={styles.brand}>
      <div className={styles.logo} aria-hidden="true">
        <FolderLogoIcon />
      </div>
      <div className={styles.brandText}>
        <p className={styles.brandTitle}>DMS</p>
        <p className={styles.brandSubtitle}>Document Management System</p>
        <div className={styles.brandRule} aria-hidden="true" />
      </div>
    </header>
  );
}

function LoginFeatures() {
  return (
    <>
      <div className={styles.dividerOr} aria-hidden="true">or</div>
      <ul className={styles.features}>
        <li className={styles.featureItem}>
          <span className={styles.featureIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3l7 4v5c0 4.4-3 8-7 9-4-1-7-4.6-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className={styles.featureLabel}>Secure</span>
        </li>
        <li className={styles.featureItem}>
          <span className={styles.featureIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className={styles.featureLabel}>Private</span>
        </li>
        <li className={styles.featureItem}>
          <span className={styles.featureIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 2L4 14h7l-1 8 10-14h-7l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={styles.featureLabel}>Instant</span>
        </li>
      </ul>
    </>
  );
}

function LoginHero() {
  return (
    <div className={styles.heroPanel} aria-hidden="true">
      <div className={styles.heroArt}>
        <div className={styles.heroDots} />
        <div className={styles.heroWave} />
        <div className={styles.heroOrbit}>
          <span className={`${styles.orbitIcon} ${styles.orbitIconTop}`}>
            <FolderLogoIcon />
          </span>
          <span className={`${styles.orbitIcon} ${styles.orbitIconRight}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className={`${styles.orbitIcon} ${styles.orbitIconBottom}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className={`${styles.orbitIcon} ${styles.orbitIconLeft}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
              <path d="M14 4v4h4M10 13h8M10 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        <div className={styles.heroPedestal} />
        <div className={styles.heroFolder}>
          <div className={styles.heroFolderTab} />
          <div className={styles.heroFolderDocs} />
          <div className={styles.heroShield}>
            <div className={styles.heroShieldLock} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardFooter() {
  return (
    <footer className={styles.cardFooter}>
      <span className={styles.footerCheck} aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
      Trusted by thousands of users
    </footer>
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
        className={styles.primaryButton}
        onClick={onVerify}
        disabled={isVerifying}
      >
        <SendIcon />
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
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
    event.target.value = digitsOnly;
    mobileField.onChange(event);

    if (showOtpStep) {
      resetOtpStep();
    }
  }

  async function sendOtpToMobile(mobile) {
    setOtpError('');
    setIsSendingOtp(true);

    try {
      await generateOTP(mobile);
      toast.success('OTP sent successfully');
      setMobileNumber(mobile);
      setOtpDigits(emptyOtpDigits());
      setShowOtpStep(true);
      setResendSeconds(RESEND_SECONDS);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch (error) {
      toast.error(
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
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to verify OTP. Please try again.'),
      );
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.formPanel}>
            <LoginBrand />

            {!showOtpStep ? (
              <>
                <div>
                  <h1 className={styles.headline}>
                    Access what matters.
                    <br />
                    <span className={styles.headlineAccent}>Securely.</span>
                  </h1>
                </div>

                <form
                  className={styles.mobileForm}
                  onSubmit={handleSubmit(onSendOtp)}
                  noValidate
                >
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="mobile">
                      Mobile Number
                    </label>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="Enter mobile number"
                      className={`${styles.mobileInput} ${errors.mobile ? styles.mobileInputInvalid : ''}`}
                      disabled={isSendingOtp}
                      maxLength={10}
                      name={mobileField.name}
                      ref={mobileField.ref}
                      onBlur={mobileField.onBlur}
                      onChange={handleMobileChange}
                      aria-invalid={Boolean(errors.mobile)}
                      aria-describedby={errors.mobile ? 'mobile-error' : undefined}
                    />
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
                    <SendIcon />
                    {isSendingOtp ? 'Sending OTP…' : 'Send OTP'}
                  </button>
                </form>

                <LoginFeatures />
              </>
            ) : (
              <>
                <div>
                  <h1 className={styles.headline}>
                    Verify your
                    <br />
                    <span className={styles.headlineAccent}>mobile number.</span>
                  </h1>
                  <p className={styles.instruction} id="sign-in-hint">
                    Enter the OTP sent to your phone.
                  </p>
                </div>

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
              </>
            )}
          </div>

          <LoginHero />
        </div>

        <CardFooter />
      </div>
    </div>
  );
}
