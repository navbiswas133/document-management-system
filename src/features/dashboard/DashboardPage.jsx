import { Link } from 'react-router-dom';
import styles from './DashboardPage.module.css';

// Static placeholder values for visual development only — not from the API.
const summaryItems = [
  { id: 'documents', label: 'Total documents', value: '0' },
  { id: 'uploads', label: 'Recent uploads', value: '0' },
  { id: 'tags', label: 'Active tags', value: '0' },
];

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.description}>
          Welcome back. Review your document activity and pick up where you left
          off.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="summary-heading">
        <h2 id="summary-heading" className={styles.sectionTitle}>
          Overview
        </h2>
        <ul className={styles.cards}>
          {summaryItems.map((item) => (
            <li key={item.id}>
              <article className={styles.card} aria-labelledby={`${item.id}-label`}>
                <p id={`${item.id}-label`} className={styles.cardLabel}>
                  {item.label}
                </p>
                <p
                  className={styles.cardValue}
                  aria-label={`${item.label}: placeholder value ${item.value}`}
                >
                  {item.value}
                </p>
                <p className={styles.cardNote}>Placeholder</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="recent-heading">
        <div className={styles.sectionHeader}>
          <h2 id="recent-heading" className={styles.sectionTitle}>
            Recent documents
          </h2>
          <p className={styles.sectionHint}>
            Your latest uploads will appear here once connected.
          </p>
        </div>

        <div className={styles.emptyState} role="status">
          <div className={styles.emptyIcon} aria-hidden="true" />
          <p className={styles.emptyTitle}>No documents yet</p>
          <p className={styles.emptyText}>
            When you upload files, they will show up in this list for quick
            access.
          </p>
          <Link to="/documents/upload" className={styles.emptyAction}>
            Upload a document
          </Link>
        </div>
      </section>
    </div>
  );
}
