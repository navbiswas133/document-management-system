import styles from './DocumentSearch.module.css';

const DEFAULT_MAJOR_CATEGORIES = ['Company', 'Personal', 'Professional'];

export function DocumentSearch({
  searchQuery,
  filters,
  majorCategoryOptions,
  minorCategoryOptions,
  filtersActive,
  onSearchChange,
  onFilterChange,
  onClear,
}) {
  return (
    <section className={styles.panel} aria-label="File search">
      <div className={styles.searchRow}>
        <div className={styles.searchField}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search documents…"
            aria-label="Search documents"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-major-category">
            Major category
          </label>
          <div className={styles.selectWrap}>
            <select
              id="filter-major-category"
              className={styles.filterSelect}
              value={filters.majorHead}
              onChange={(event) => onFilterChange('majorHead', event.target.value)}
            >
              <option value="">All major categories</option>
              {majorCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-minor-category">
            Minor category
          </label>
          <div className={styles.selectWrap}>
            <select
              id="filter-minor-category"
              className={styles.filterSelect}
              value={filters.minorHead}
              onChange={(event) => onFilterChange('minorHead', event.target.value)}
            >
              <option value="">All minor categories</option>
              {minorCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-tag-1">
            Tag 1
          </label>
          <input
            id="filter-tag-1"
            type="text"
            className={styles.filterInput}
            placeholder="Enter tag"
            value={filters.tag1}
            onChange={(event) => onFilterChange('tag1', event.target.value)}
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-tag-2">
            Tag 2
          </label>
          <input
            id="filter-tag-2"
            type="text"
            className={styles.filterInput}
            placeholder="Enter tag"
            value={filters.tag2}
            onChange={(event) => onFilterChange('tag2', event.target.value)}
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-from-date">
            From date
          </label>
          <input
            id="filter-from-date"
            type="date"
            className={styles.filterInput}
            value={filters.fromDate}
            max={filters.toDate || undefined}
            onChange={(event) => onFilterChange('fromDate', event.target.value)}
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="filter-to-date">
            To date
          </label>
          <input
            id="filter-to-date"
            type="date"
            className={styles.filterInput}
            value={filters.toDate}
            min={filters.fromDate || undefined}
            onChange={(event) => onFilterChange('toDate', event.target.value)}
          />
        </div>

        {filtersActive && (
          <div className={styles.filterActions}>
            <button
              type="button"
              className={styles.clearFiltersButton}
              onClick={onClear}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Clear
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function getDefaultMajorCategories(documents) {
  const fromResults = [
    ...new Set(documents.map((doc) => doc.category).filter(Boolean)),
  ];

  return [...new Set([...DEFAULT_MAJOR_CATEGORIES, ...fromResults])].sort();
}

export function getMinorCategories(documents, majorHead) {
  return [
    ...new Set(
      documents
        .filter((doc) => !majorHead || doc.category === majorHead)
        .map((doc) => doc.department)
        .filter(Boolean),
    ),
  ].sort();
}
