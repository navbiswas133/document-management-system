import { fetchDocumentTagEntries } from '../documents/documentsApi';

export const TOP_TAGS_LIMIT = 7;

const TAG_BAR_PALETTE = [
  '#c4b5fd',
  '#bbf7d0',
  '#fde68a',
  '#bfdbfe',
  '#fecdd3',
  '#c4b5fd',
  '#e5e7eb',
];

const TAG_COLOR_BY_LABEL = {
  invoice: '#c4b5fd',
  important: '#bbf7d0',
  project: '#fde68a',
  tax: '#bfdbfe',
  identity: '#fecdd3',
  hr: '#c4b5fd',
  others: '#e5e7eb',
};

export function getTagBarWidth(count, maxCount) {
  if (maxCount <= 0) {
    return 0;
  }

  return Math.round((count / maxCount) * 100);
}

export function getTagBarColor(label, index) {
  const normalized = label.trim().toLowerCase();

  if (TAG_COLOR_BY_LABEL[normalized]) {
    return TAG_COLOR_BY_LABEL[normalized];
  }

  return TAG_BAR_PALETTE[index % TAG_BAR_PALETTE.length];
}

export function buildTopTagsChart(entries, limit = TOP_TAGS_LIMIT) {
  const sorted = [...entries].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.label.localeCompare(right.label, undefined, { sensitivity: 'base' });
  });

  return sorted.slice(0, limit).map((entry, index) => ({
    id: entry.id,
    label: entry.label,
    count: entry.count,
    barColor: getTagBarColor(entry.label, index),
  }));
}

export async function loadTopTags(limit = TOP_TAGS_LIMIT) {
  const entries = await fetchDocumentTagEntries('');

  if (entries.length === 0) {
    return [];
  }

  const normalized = entries.map((entry) => ({
    ...entry,
    count: entry.count ?? 1,
  }));

  return buildTopTagsChart(normalized, limit);
}
