import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { isAdminPortal } from '../../constants/adminAuth';
import {
  adminNavLinks,
  NavIcon,
  userNavLinks,
} from './sidebarNav.jsx';
import { useMobileNav } from './useMobileNav';
import styles from './MobileNav.module.css';

export function MobileNav() {
  const isMobileNav = useMobileNav();
  const auth = useSelector((state) => state.auth);
  const navLinks = isAdminPortal(auth) ? adminNavLinks : userNavLinks;

  if (!isMobileNav) {
    return null;
  }

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
        >
          <span className={styles.icon}>
            <NavIcon name={link.icon} />
          </span>
          <span className={styles.label}>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
