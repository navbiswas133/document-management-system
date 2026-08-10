import {
  buildSearchRequestBody,
  PAGE_SIZE,
  searchDocuments,
} from '../documents/documentsApi';
import { parseSearchDocumentResponse } from '../documents/searchDocumentResponse';
import { getFileTone } from '../documents/placeholderDocuments';

export const RECENT_DOCUMENTS_LIMIT = 5;

function formatDashboardDate(dateString) {
  if (!dateString) {
    return '—';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getUploadTimestamp(uploadTime) {
  const timestamp = new Date(uploadTime).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortDocumentsByUploadTime(documents) {
  return [...documents].sort(
    (left, right) =>
      getUploadTimestamp(right.upload_time) - getUploadTimestamp(left.upload_time),
  );
}

export function mapDocumentForDashboard(listDoc) {
  return {
    id: listDoc.id,
    name: listDoc.name,
    category: listDoc.category,
    subcategory: listDoc.department,
    date: listDoc.upload_time
      ? formatDashboardDate(listDoc.upload_time)
      : listDoc.date,
    size: '—',
    type: getFileTone(listDoc.name),
  };
}

export async function loadRecentDocuments(limit = RECENT_DOCUMENTS_LIMIT) {
  const responseData = await searchDocuments(
    buildSearchRequestBody({
      start: 0,
      length: Math.max(limit, PAGE_SIZE),
    }),
  );

  const { documents } = parseSearchDocumentResponse(responseData);

  return sortDocumentsByUploadTime(documents)
    .slice(0, limit)
    .map(mapDocumentForDashboard);
}
