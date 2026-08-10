import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { isAdminPortal } from '../../constants/adminAuth';
import { BRANDING } from '../../constants/branding';
import { logout } from '../../store/authSlice';
import {
  adminNavLinks,
  NavIcon,
  userNavLinks,
} from './sidebarNav.jsx';
import styles from './Sidebar.module.css';

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const navLinks = isAdminPortal(auth) ? adminNavLinks : userNavLinks;
  const showFaviconBrand = isCollapsed;

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
              src={showFaviconBrand ? BRANDING.favicon : BRANDING.logo}
              alt={BRANDING.name}
              className={showFaviconBrand ? styles.brandFavicon : styles.brandLogo}
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
