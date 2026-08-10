import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { isAdminPortal } from '../../constants/adminAuth';
import { BRANDING } from '../../constants/branding';
import { logout } from '../../store/authSlice';
import styles from './Sidebar.module.css';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/documents', label: 'Documents', icon: 'folder', end: true },
  { to: '/documents/upload', label: 'Upload', icon: 'upload' },
];

const adminLinks = [
  { to: '/admin', label: 'Create user', icon: 'admin', end: true },
];

function NavIcon({ name }) {
  switch (name) {
    case 'dashboard':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'folder':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 7a2 2 0 012-2h5l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'upload':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 16V4M12 4L8 8M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'admin':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
          <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'logout':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 17l-5-5 5-5M5 12h12M15 7V5a2 2 0 012-2h3v16h-3a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'chevronLeft':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'chevronRight':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const navLinks = isAdminPortal(auth) ? adminLinks : userLinks;

  function handleLogout() {
    dispatch(logout());
    onClose();
    navigate('/login');
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}

      <div
        className={`${styles.sidebarShell} ${isCollapsed ? styles.sidebarShellCollapsed : ''}`}
      >
        <aside
          className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}
          aria-label="Main navigation"
        >
          <div className={styles.brand}>
            <img
              src={isCollapsed ? BRANDING.favicon : BRANDING.logo}
              alt={BRANDING.name}
              className={isCollapsed ? styles.brandFavicon : styles.brandLogo}
            />
          </div>

          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                title={isCollapsed ? link.label : undefined}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.linkActive}` : styles.link
                }
                onClick={onClose}
              >
                <span className={styles.linkIcon}>
                  <NavIcon name={link.icon} />
                </span>
                <span className={styles.linkLabel}>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.footer}>
          <button
            type="button"
            className={styles.logout}
            title={isCollapsed ? 'Logout' : undefined}
            aria-label="Logout"
            onClick={handleLogout}
          >
            <NavIcon name="logout" />
            <span className={styles.logoutLabel}>Logout</span>
          </button>
          </div>
        </aside>

        <button
          type="button"
          className={styles.collapseButton}
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <NavIcon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} />
        </button>
      </div>
    </>
  );
}
