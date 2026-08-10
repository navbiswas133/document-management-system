import {
  buildSearchRequestBody,
  fetchDocumentTagEntries,
  searchDocuments,
} from '../documents/documentsApi';
import { parseSearchDocumentResponse } from '../documents/searchDocumentResponse';
import { buildTopTagsChart } from './topTagsFeature';
import {
  mapDocumentForDashboard,
  RECENT_DOCUMENTS_LIMIT,
  sortDocumentsByUploadTime,
} from './recentDocumentsFeature';
import {
  buildStatCards,
  formatStatValue,
} from './dashboardStatsFeature';

const DASHBOARD_SEARCH_LENGTH = 1000;

let dashboardDataCache = null;
let loadingPromise = null;

export function clearDashboardDataCache() {
  dashboardDataCache = null;
  loadingPromise = null;
}

export async function loadDashboardData() {
  if (dashboardDataCache) {
    return dashboardDataCache;
  }

  if (!loadingPromise) {
    loadingPromise = fetchDashboardData()
      .then((data) => {
        dashboardDataCache = data;
        return data;
      })
      .catch((error) => {
        dashboardDataCache = null;
        throw error;
      })
      .finally(() => {
        loadingPromise = null;
      });
  }

  return loadingPromise;
}

async function fetchDashboardData() {
  const [tagEntries, searchResponse] = await Promise.all([
    fetchDocumentTagEntries(''),
    searchDocuments(
      buildSearchRequestBody({
        start: 0,
        length: DASHBOARD_SEARCH_LENGTH,
      }),
    ),
  ]);

  const { documents, total } = parseSearchDocumentResponse(searchResponse);
  const sortedDocuments = sortDocumentsByUploadTime(documents);

  const personalDocuments = documents.filter(
    (document) => document.category === 'Personal',
  ).length;
  const professionalDocuments = documents.filter(
    (document) => document.category === 'Professional',
  ).length;

  return {
    stats: {
      totalDocuments: total,
      personalDocuments,
      professionalDocuments,
      totalTags: tagEntries.length,
    },
    topTags: buildTopTagsChart(
      tagEntries.map((entry) => ({
        ...entry,
        count: entry.count ?? 1,
      })),
    ),
    recentDocuments: sortedDocuments
      .slice(0, RECENT_DOCUMENTS_LIMIT)
      .map(mapDocumentForDashboard),
  };
}

export function buildDashboardStatCards(stats, { isLoading = false, error = '' } = {}) {
  return buildStatCards(stats, { isLoading, error });
}

export { formatStatValue };
