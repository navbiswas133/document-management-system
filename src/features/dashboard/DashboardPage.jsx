import { Link } from 'react-router-dom';
import {
  quickActions,
  statCards,
} from './placeholderDashboardData';
import { getTagBarWidth } from './topTagsFeature';
import { useRecentDocuments } from './useRecentDocuments';
import { useTopTags } from './useTopTags';
import styles from './DashboardPage.module.css';

function StatIcon({ tone }) {
  const className = `${styles.statIcon} ${styles[`statIcon_${tone}`]}`;

  return (
    <div className={className} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function FileIcon({ type }) {
  const className = `${styles.fileIcon} ${styles[`fileIcon_${type}`]}`;

  return (
    <div className={className} aria-hidden="true">
      {type === 'image' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
          <path d="M4 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : type === 'doc' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 4v4h4M10 13h8M10 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function QuickActionIcon({ id }) {
  const icons = {
    upload: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    search: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    user: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
        <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    tags: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 12l-8 8-4-4-6-6 8-8 6 6 4 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    reports: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  };

  return icons[id] ?? icons.search;
}

export function DashboardPage() {
  const { topTags, isLoading: isLoadingTopTags, error: topTagsError } = useTopTags();
  const {
    recentDocuments,
    isLoading: isLoadingRecentDocuments,
    error: recentDocumentsError,
  } = useRecentDocuments();
  const maxTagCount = Math.max(...topTags.map((tag) => tag.count), 1);

  return (
    <div className={styles.page}>
      <ul className={styles.statGrid}>
        {statCards.map((card) => (
          <li key={card.id}>
            <article className={styles.statCard}>
              <StatIcon tone={card.tone} />
              <div className={styles.statBody}>
                <p className={styles.statLabel}>{card.label}</p>
                <p className={styles.statValue}>{card.value}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className={styles.middleGrid}>
        <section className={styles.panel} aria-labelledby="recent-docs-heading">
          <div className={styles.panelHeader}>
            <h2 id="recent-docs-heading" className={styles.panelTitle}>
              Recent Documents
            </h2>
            <Link to="/documents" className={styles.panelLink}>
              View All
            </Link>
          </div>

          {isLoadingRecentDocuments && (
            <p className={styles.tagPanelMessage}>Loading recent documents…</p>
          )}

          {recentDocumentsError && !isLoadingRecentDocuments && (
            <p className={styles.tagPanelError}>{recentDocumentsError}</p>
          )}

          {!isLoadingRecentDocuments &&
            !recentDocumentsError &&
            recentDocuments.length === 0 && (
              <p className={styles.tagPanelMessage}>No documents available.</p>
            )}

          {!isLoadingRecentDocuments &&
            !recentDocumentsError &&
            recentDocuments.length > 0 && (
              <ul className={styles.docList}>
                {recentDocuments.map((doc) => (
                  <li key={doc.id} className={styles.docRow}>
                    <FileIcon type={doc.type} />
                    <div className={styles.docMain}>
                      <p className={styles.docName}>{doc.name}</p>
                      <p className={styles.docMeta}>
                        {doc.category} • {doc.subcategory}
                      </p>
                    </div>
                    <p className={styles.docDate}>{doc.date}</p>
                    <p className={styles.docSize}>{doc.size}</p>
                  </li>
                ))}
              </ul>
            )}
        </section>

        <section className={styles.panel} aria-labelledby="top-tags-heading">
          <div className={styles.panelHeader}>
            <h2 id="top-tags-heading" className={styles.panelTitle}>
              Top Tags
            </h2>
            <Link to="/documents" className={styles.panelLink}>
              View all
            </Link>
          </div>

          {isLoadingTopTags && (
            <p className={styles.tagPanelMessage}>Loading top tags…</p>
          )}

          {topTagsError && !isLoadingTopTags && (
            <p className={styles.tagPanelError}>{topTagsError}</p>
          )}

          {!isLoadingTopTags && !topTagsError && topTags.length === 0 && (
            <p className={styles.tagPanelMessage}>No tags available.</p>
          )}

          {!isLoadingTopTags && !topTagsError && topTags.length > 0 && (
            <ul className={styles.tagBarList}>
              {topTags.map((tag) => (
                <li key={tag.id} className={styles.tagBarRow}>
                  <span className={styles.tagBarLabel}>{tag.label}</span>
                  <div className={styles.tagBarTrack}>
                    <div
                      className={styles.tagBarFill}
                      style={{
                        width: `${getTagBarWidth(tag.count, maxTagCount)}%`,
                        backgroundColor: tag.barColor,
                      }}
                    />
                  </div>
                  <span className={styles.tagBarCount}>{tag.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={styles.quickActionsPanel} aria-labelledby="quick-actions-heading">
        <div className={styles.panelHeader}>
          <h2 id="quick-actions-heading" className={styles.panelTitle}>
            Quick Actions
          </h2>
        </div>

        <div className={styles.quickActionsBody}>
          <ul className={styles.quickActionsList}>
            {quickActions.map((action) => (
              <li key={action.id}>
                <Link to={action.to} className={styles.quickAction}>
                  <span className={styles.quickActionIcon}>
                    <QuickActionIcon id={action.id} />
                  </span>
                  <span className={styles.quickActionLabel}>{action.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.quickActionsArt} aria-hidden="true">
            <div className={styles.artBox} />
            <div className={styles.artPlant} />
          </div>
        </div>
      </section>
    </div>
  );
}
