import { useEffect, useState } from 'react';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useMobileNav } from '../../components/layout/useMobileNav';
import { handleDateFieldClick } from '../../lib/datePickerField';
import styles from './DocumentSearch.module.css';

const DEFAULT_MAJOR_CATEGORIES = ['Company', 'Personal', 'Professional'];

function FilterLabel({ icon, tone, children }) {
  return (
    <span className={styles.filterLabel}>
      <span className={`${styles.labelIcon} ${styles[`labelIcon_${tone}`]}`} aria-hidden="true">
        {icon}
      </span>
      {children}
    </span>
  );
}

function InputWrap({ icon, tone, children, isDateField = false }) {
  const wrapClassName = isDateField
    ? `${styles.inputWrap} dateFieldWrap`
    : styles.inputWrap;

  return (
    <div
      className={wrapClassName}
      onClick={isDateField ? handleDateFieldClick : undefined}
    >
      <span className={`${styles.fieldIcon} ${styles[`fieldIcon_${tone}`]}`} aria-hidden="true">
        {icon}
      </span>
      {children}
    </div>
  );
}

export function DocumentSearch({
  filters,
  majorCategoryOptions,
  minorCategoryOptions,
  filtersActive,
  onFilterChange,
  onClear,
}) {
  const isMobile = useMobileNav();
  const [isFiltersOpen, setIsFiltersOpen] = useState(!isMobile);

  useEffect(() => {
    setIsFiltersOpen(!isMobile);
  }, [isMobile]);

  return (
    <section className={styles.panel} aria-label="Document filters">
      {isMobile && (
        <button
          type="button"
          className={styles.filtersToggle}
          aria-expanded={isFiltersOpen}
          onClick={() => setIsFiltersOpen((open) => !open)}
        >
          <span className={styles.filtersToggleMain}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h10M4 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Filters
            {filtersActive && <span className={styles.filtersActiveBadge}>Active</span>}
          </span>
          <svg
            className={`${styles.filtersChevron} ${isFiltersOpen ? styles.filtersChevronOpen : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <div
        className={`${styles.filtersBody} ${isMobile && !isFiltersOpen ? styles.filtersBodyHidden : ''}`}
      >
        <div className={styles.filtersRow}>
        <div className={styles.filterField}>
          <label className={styles.filterLabelWrap} htmlFor="filter-major-category">
            <FilterLabel
              tone="purple"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            >
              Major category
            </FilterLabel>
          </label>
          <CustomSelect
            id="filter-major-category"
            value={filters.majorHead}
            onChange={(nextValue) => onFilterChange('majorHead', nextValue)}
            options={majorCategoryOptions}
            emptyLabel="All major categories"
            tone="purple"
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabelWrap} htmlFor="filter-minor-category">
            <FilterLabel
              tone="blue"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 20c0-3.3 2.4-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" />
                </svg>
              }
            >
              Minor category
            </FilterLabel>
          </label>
          <CustomSelect
            id="filter-minor-category"
            value={filters.minorHead}
            onChange={(nextValue) => onFilterChange('minorHead', nextValue)}
            options={minorCategoryOptions}
            emptyLabel="All minor categories"
            tone="blue"
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabelWrap} htmlFor="filter-tag-1">
            <FilterLabel
              tone="green"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12l-8 8-4-4-6-6 8-8 6 6 4 4z" stroke="currentColor" strokeWidth="2" />
                </svg>
              }
            >
              Tag 1
            </FilterLabel>
          </label>
          <InputWrap
            tone="green"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 12l-8 8-4-4-6-6 8-8 6 6 4 4z" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          >
            <input
              id="filter-tag-1"
              type="text"
              className={styles.filterInput}
              placeholder="Enter tag"
              value={filters.tag1}
              onChange={(event) => onFilterChange('tag1', event.target.value)}
            />
          </InputWrap>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabelWrap} htmlFor="filter-tag-2">
            <FilterLabel
              tone="teal"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12l-8 8-4-4-6-6 8-8 6 6 4 4z" stroke="currentColor" strokeWidth="2" />
                </svg>
              }
            >
              Tag 2
            </FilterLabel>
          </label>
          <InputWrap
            tone="teal"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 12l-8 8-4-4-6-6 8-8 6 6 4 4z" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          >
            <input
              id="filter-tag-2"
              type="text"
              className={styles.filterInput}
              placeholder="Enter tag"
              value={filters.tag2}
              onChange={(event) => onFilterChange('tag2', event.target.value)}
            />
          </InputWrap>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabelWrap} htmlFor="filter-from-date">
            <FilterLabel
              tone="orange"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            >
              From date
            </FilterLabel>
          </label>
          <InputWrap
            tone="orange"
            isDateField
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          >
            <input
              id="filter-from-date"
              type="date"
              className={styles.filterInput}
              value={filters.fromDate}
              max={filters.toDate || undefined}
              onChange={(event) => onFilterChange('fromDate', event.target.value)}
            />
          </InputWrap>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabelWrap} htmlFor="filter-to-date">
            <FilterLabel
              tone="pink"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            >
              To date
            </FilterLabel>
          </label>
          <InputWrap
            tone="pink"
            isDateField
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          >
            <input
              id="filter-to-date"
              type="date"
              className={styles.filterInput}
              value={filters.toDate}
              min={filters.fromDate || undefined}
              onChange={(event) => onFilterChange('toDate', event.target.value)}
            />
          </InputWrap>
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
