import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../../lib/apiResponse';
import {
  ADMIN_OTP,
  ADMIN_SESSION_TOKEN,
  isAdminMobile,
} from '../../constants/adminAuth';
import { BRANDING } from '../../constants/branding';
import { setCredentials } from '../../store/authSlice';
import { generateOTP, validateOTP } from './authApi';
import { LoginHero } from './LoginHero';
import { SendIcon } from './loginIcons';
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

function openOtpStep(setters, otpRefs) {
  setters.setOtpDigits(emptyOtpDigits());
  setters.setShowOtpStep(true);
  setters.setResendSeconds(RESEND_SECONDS);
  window.setTimeout(() => otpRefs.current[0]?.focus(), 0);
}

function LoginBrand() {
  return (
    <header className={styles.brand}>
      <img
        src={BRANDING.logo}
        alt={BRANDING.name}
        className={styles.brandLogoImage}
      />
    </header>
  );
}

function LoginFeatures() {
  const items = [
    {
      label: 'Secure',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3l7 4v5c0 4.4-3 8-7 9-4-1-7-4.6-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Private',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Instant',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M13 2L4 14h7l-1 8 10-14h-7l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className={styles.dividerOr} aria-hidden="true">or</div>
      <ul className={styles.features}>
        {items.map((item) => (
          <li key={item.label} className={styles.featureItem}>
            <span className={styles.featureIcon}>{item.icon}</span>
            <span className={styles.featureLabel}>{item.label}</span>
          </li>
        ))}
      </ul>
    </>
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
      <span className={styles.footerText}>Trusted by thousands of users</span>
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
  const portal = useSelector((state) => state.auth.portal);
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
      navigate(portal === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [token, portal, navigate]);

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
      if (!isAdminMobile(mobile)) {
        await generateOTP(mobile);
      }

      toast.success('OTP sent successfully');
      setMobileNumber(mobile);
      openOtpStep(
        { setOtpDigits, setShowOtpStep, setResendSeconds },
        otpRefs,
      );
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
      if (isAdminMobile(mobileNumber)) {
        if (otp !== ADMIN_OTP) {
          setOtpError('Invalid OTP. Please try again.');
          toast.error('Invalid OTP. Please try again.');
          return;
        }

        dispatch(
          setCredentials({
            token: ADMIN_SESSION_TOKEN,
            user_id: 'admin',
            user_name: 'Admin',
            roles: ['Admin'],
            portal: 'admin',
          }),
        );
        toast.success('Admin login successful');
        navigate('/admin');
        return;
      }

      const authData = await validateOTP(mobileNumber, otp);
      dispatch(
        setCredentials({
          token: authData.token,
          user_id: authData.user_id,
          user_name: authData.user_name,
          roles: authData.roles ?? [],
          portal: 'user',
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
                <div className={styles.intro}>
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
                <div className={styles.intro}>
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
