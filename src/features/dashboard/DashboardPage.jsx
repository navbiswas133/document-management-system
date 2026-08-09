import styles from './DashboardPage.module.css';

const summaryItems = [
  { id: 'documents', label: 'Documents' },
  { id: 'uploads', label: 'Uploads' },
  { id: 'tags', label: 'Tags' },
];

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.description}>
          Welcome to the document management system. Use this page to get an
          overview of your documents once data is connected.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="summary-heading">
        <h2 id="summary-heading" className={styles.sectionTitle}>
          Overview
        </h2>
        <div className={styles.cards}>
          {summaryItems.map((item) => (
            <article key={item.id} className={styles.card}>
              <p className={styles.cardLabel}>{item.label}</p>
              <p className={styles.cardValue} aria-label={`${item.label} placeholder`}>
                —
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="recent-heading">
        <h2 id="recent-heading" className={styles.sectionTitle}>
          Recent documents
        </h2>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No documents yet</p>
          <p className={styles.emptyText}>
            Recent uploads will appear here when document data is available.
          </p>
        </div>
      </section>
    </div>
  );
}
