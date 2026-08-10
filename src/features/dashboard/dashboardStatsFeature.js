import {
  buildSearchRequestBody,
  fetchDocumentTagEntries,
  searchDocuments,
} from '../documents/documentsApi';
import { parseSearchDocumentResponse } from '../documents/searchDocumentResponse';

export const DASHBOARD_STAT_DEFINITIONS = [
  {
    id: 'total',
    label: 'Total Documents',
    tone: 'purple',
    field: 'totalDocuments',
  },
  {
    id: 'personal',
    label: 'Personal Documents',
    tone: 'green',
    field: 'personalDocuments',
  },
  {
    id: 'professional',
    label: 'Professional Documents',
    tone: 'blue',
    field: 'professionalDocuments',
  },
  {
    id: 'tags',
    label: 'Total Tags',
    tone: 'orange',
    field: 'totalTags',
  },
];

const EMPTY_STATS = {
  totalDocuments: 0,
  personalDocuments: 0,
  professionalDocuments: 0,
  totalTags: 0,
};

export function formatStatValue(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US').format(parsed);
}

export async function loadDashboardStats(options = {}) {
  const allResponse = await searchDocuments(
    buildSearchRequestBody({ start: 0, length: 1 }),
    options,
  );

  const personalResponse = await searchDocuments(
    buildSearchRequestBody({
      majorHead: 'Personal',
      start: 0,
      length: 1,
    }),
    options,
  );

  const professionalResponse = await searchDocuments(
    buildSearchRequestBody({
      majorHead: 'Professional',
      start: 0,
      length: 1,
    }),
    options,
  );

  const tagEntries = await fetchDocumentTagEntries('', options);

  return {
    totalDocuments: parseSearchDocumentResponse(allResponse).total,
    personalDocuments: parseSearchDocumentResponse(personalResponse).total,
    professionalDocuments: parseSearchDocumentResponse(professionalResponse).total,
    totalTags: tagEntries.length,
  };
}

export function buildStatCards(stats, { isLoading = false, error = '' } = {}) {
  const values = stats ?? EMPTY_STATS;

  return DASHBOARD_STAT_DEFINITIONS.map((definition) => {
    let displayValue = '0';

    if (isLoading) {
      displayValue = '…';
    } else if (error) {
      displayValue = '—';
    } else {
      displayValue = formatStatValue(values[definition.field]);
    }

    return {
      id: definition.id,
      label: definition.label,
      tone: definition.tone,
      value: displayValue,
    };
  });
}
