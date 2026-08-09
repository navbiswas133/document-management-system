import { mapDocumentForList } from './documentMapper';

export function parseSearchDocumentResponse(responseData) {
  const entries = responseData?.data;

  if (!Array.isArray(entries)) {
    return {
      documents: [],
      total: 0,
    };
  }

  const total =
    responseData.recordsTotal ??
    entries[0]?.total_count ??
    entries.length;

  return {
    documents: entries.map(mapDocumentForList),
    total,
  };
}
