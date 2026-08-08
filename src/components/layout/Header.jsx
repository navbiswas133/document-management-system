import styles from './Header.module.css';

export function Header({ onMenuClick }) {
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
      >
        Menu
      </button>
      <h1 className={styles.title}>Document Management</h1>
    </header>
  );
}
