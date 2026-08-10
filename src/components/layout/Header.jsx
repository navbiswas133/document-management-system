import { useSelector } from 'react-redux';
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

export function Header() {
  const userName = useSelector((state) => state.auth.user_name);
  const initials = getUserInitials(userName);

  return (
    <header className={styles.header}>
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search documents, tags, people..."
          aria-label="Search documents, tags, people"
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 17H9a3 3 0 01-6 0M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.badge}>1</span>
        </button>

        <button type="button" className={styles.profileButton} aria-label="User menu">
          <span className={styles.avatar}>{initials}</span>
          <span className={styles.profileName}>{userName}</span>
          <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
