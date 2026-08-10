import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { isAdminPortal } from '../../constants/adminAuth';
import { BRANDING } from '../../constants/branding';
import { logout } from '../../store/authSlice';
import { useMobileNav } from './useMobileNav';
import styles from './Header.module.css';

function getUserInitials(name) {
  if (!name?.trim()) {
    return '?';
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function normalizeRoles(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .map((role) => {
      if (typeof role === 'string') {
        return role.trim();
      }

      return String(role?.name ?? role?.role ?? '').trim();
    })
    .filter(Boolean);
}

export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobileNav = useMobileNav();

  const auth = useSelector((state) => state.auth);
  const userName = useSelector((state) => state.auth.user_name);
  const userId = useSelector((state) => state.auth.user_id);
  const roles = useSelector((state) => state.auth.roles);
  const initials = getUserInitials(userName);
  const roleList = normalizeRoles(roles);
  const primaryRole = roleList[0] ?? 'User';
  const homePath = isAdminPortal(auth) ? '/admin' : '/dashboard';

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  function handleLogout() {
    dispatch(logout());
    setIsMenuOpen(false);
    navigate('/login');
  }

  function toggleMenu() {
    setIsMenuOpen((open) => !open);
  }

  return (
    <header className={styles.header}>
      {isMobileNav && (
        <Link to={homePath} className={styles.headerBrand}>
          <img
            src={BRANDING.logo}
            alt={BRANDING.name}
            className={styles.headerBrandLogo}
          />
        </Link>
      )}

      <div className={styles.profileMenu} ref={menuRef}>
        <button
          type="button"
          className={`${styles.profile} ${isMenuOpen ? styles.profileOpen : ''}`}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-controls="profile-menu"
          aria-label="Open account menu"
        >
          <span className={styles.avatar}>{initials}</span>
          <span className={styles.profileMeta}>
            <span className={styles.profileName}>{userName || 'Account'}</span>
            <span className={styles.profileSub}>{primaryRole}</span>
          </span>
          <svg
            className={styles.profileChevron}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isMenuOpen && (
          <div
            id="profile-menu"
            className={styles.profileDialog}
            role="menu"
            aria-label="Account"
          >
            <div className={styles.dialogHeader}>
              <span className={styles.dialogAvatar}>{initials}</span>
              <div className={styles.dialogHeaderMain}>
                <p className={styles.dialogName}>{userName || 'User'}</p>
                <div className={styles.roleList}>
                  {roleList.length > 0 ? (
                    roleList.map((role) => (
                      <span key={role} className={styles.roleChip}>{role}</span>
                    ))
                  ) : (
                    <span className={styles.roleChip}>User</span>
                  )}
                </div>
                <p className={styles.dialogHint}>
                  Signed in to {BRANDING.name}
                </p>
              </div>
            </div>

            <div className={styles.dialogBody}>
              <p className={styles.sectionLabel}>Account details</p>
              <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>User ID</span>
                  <span className={styles.detailValue}>{userId || '—'}</span>
                </div>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Primary role</span>
                  <span className={styles.detailValue}>{primaryRole}</span>
                </div>
              </div>
            </div>

            <div className={styles.dialogFooter}>
              <button
                type="button"
                className={styles.signOutButton}
                role="menuitem"
                onClick={handleLogout}
              >
                <span className={styles.signOutIcon} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10 17l-5-5 5-5M5 12h12M15 7V5a2 2 0 012-2h3v16h-3a2 2 0 01-2-2v-2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className={styles.signOutText}>
                  <span className={styles.signOutTitle}>Sign out</span>
                  <span className={styles.signOutDesc}>End your current session</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
