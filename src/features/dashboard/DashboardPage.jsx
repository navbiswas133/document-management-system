import { Link } from 'react-router-dom';
import { FileIcon, QuickActionIcon, StatIcon } from './dashboardIcons';
import { quickActions } from './placeholderDashboardData';
import { getTagBarWidth } from './topTagsFeature';
import { useDashboardData } from './useDashboardData';
import styles from './DashboardPage.module.css';

function PanelHeader({ title, id, linkTo, linkLabel = 'View all' }) {
  return (
    <div className={styles.panelHeader}>
      <h2 id={id} className={styles.panelTitle}>{title}</h2>
      {linkTo && (
        <Link to={linkTo} className={styles.panelLink}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function PanelMessage({ children }) {
  return <p className={styles.panelMessage}>{children}</p>;
}

export function DashboardPage() {
  const {
    statCards,
    topTags,
    recentDocuments,
    isLoadingTopTags,
    isLoadingRecentDocuments,
    hasTopTagsError,
    hasRecentDocumentsError,
  } = useDashboardData();
  const maxTagCount = Math.max(...topTags.map((tag) => tag.count), 1);

  return (
    <div className={styles.page}>
      <ul className={styles.statGrid}>
        {statCards.map((card) => (
          <li key={card.id}>
            <article className={styles.statCard}>
              <StatIcon
                className={`${styles.statIcon} ${styles[`statIcon_${card.tone}`]}`}
              />
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
          <PanelHeader
            id="recent-docs-heading"
            title="Recent Documents"
            linkTo="/documents"
            linkLabel="View All"
          />

          {isLoadingRecentDocuments && (
            <PanelMessage>Loading recent documents…</PanelMessage>
          )}

          {!isLoadingRecentDocuments && !hasRecentDocumentsError && recentDocuments.length === 0 && (
            <PanelMessage>No documents available.</PanelMessage>
          )}

          {!isLoadingRecentDocuments && hasRecentDocumentsError && (
            <PanelMessage>Unable to load recent documents.</PanelMessage>
          )}

          {!isLoadingRecentDocuments &&
            !hasRecentDocumentsError &&
            recentDocuments.length > 0 && (
              <ul className={styles.docList}>
                {recentDocuments.map((doc) => (
                  <li key={doc.id} className={styles.docRow}>
                    <FileIcon
                      type={doc.type}
                      className={`${styles.fileIcon} ${styles[`fileIcon_${doc.type}`]}`}
                    />
                    <div className={styles.docMain}>
                      <p className={styles.docName}>{doc.name}</p>
                      <p className={styles.docMeta}>
                        {doc.category} • {doc.subcategory}
                      </p>
                    </div>
                    <div className={styles.docDetails}>
                      <span className={styles.docDate}>{doc.date}</span>
                      <span className={styles.docSize}>{doc.size}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </section>

        <section className={styles.panel} aria-labelledby="top-tags-heading">
          <PanelHeader
            id="top-tags-heading"
            title="Top Tags"
            linkTo="/documents"
          />

          {isLoadingTopTags && <PanelMessage>Loading top tags…</PanelMessage>}

          {!isLoadingTopTags && !hasTopTagsError && topTags.length === 0 && (
            <PanelMessage>No tags available.</PanelMessage>
          )}

          {!isLoadingTopTags && hasTopTagsError && (
            <PanelMessage>Unable to load top tags.</PanelMessage>
          )}

          {!isLoadingTopTags && !hasTopTagsError && topTags.length > 0 && (
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
        <PanelHeader id="quick-actions-heading" title="Quick Actions" />

        <div className={styles.quickActionsBody}>
          <ul className={styles.quickActionsList}>
            {quickActions.map((action) => (
              <li key={action.id} className={styles.quickActionsItem}>
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
