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
      <div className={styles.profile} aria-label={`Signed in as ${userName}`}>
        <span className={styles.avatar}>{initials}</span>
        <span className={styles.profileName}>{userName}</span>
      </div>
    </header>
  );
}
