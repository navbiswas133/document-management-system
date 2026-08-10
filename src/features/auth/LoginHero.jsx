import { FolderLogoIcon } from './loginIcons';
import styles from './LoginPage.module.css';

export function LoginHero() {
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
