export function StatIcon({ className }) {
  return (
    <div className={className} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function FileIcon({ type, className }) {
  const icons = {
    image: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
        <path d="M4 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    doc: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
        <path d="M14 4v4h4M10 13h8M10 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    pdf: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 4h8l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
        <path d="M14 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  };

  return (
    <div className={className} aria-hidden="true">
      {icons[type] ?? icons.pdf}
    </div>
  );
}

const quickActionIcons = {
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
};

export function QuickActionIcon({ id }) {
  return quickActionIcons[id] ?? quickActionIcons.search;
}
