function isDocumentEntry(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function extractDocumentEntries(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (isDocumentEntry(responseData) && Array.isArray(responseData.data)) {
    return responseData.data;
  }

  if (import.meta.env.DEV) {
    console.info(
      '[documents] Unrecognized searchDocumentEntry response shape:',
      responseData,
    );
  }

  return null;
}

function mapTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => (typeof tag?.tag_name === 'string' ? tag.tag_name.trim() : ''))
    .filter(Boolean);
}

function buildDocumentLabel(entry) {
  const majorHead =
    typeof entry.major_head === 'string' ? entry.major_head.trim() : '';
  const minorHead =
    typeof entry.minor_head === 'string' ? entry.minor_head.trim() : '';

  if (majorHead && minorHead) {
    return `${majorHead} — ${minorHead}`;
  }

  if (majorHead) {
    return majorHead;
  }

  if (minorHead) {
    return minorHead;
  }

  return 'Document';
}

function buildDocumentId(entry, index) {
  const parts = [
    typeof entry.major_head === 'string' ? entry.major_head.trim() : '',
    typeof entry.minor_head === 'string' ? entry.minor_head.trim() : '',
    typeof entry.document_date === 'string' ? entry.document_date.trim() : '',
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join('|');
  }

  return `document-${index}`;
}

export function mapDocumentForList(entry, index) {
  if (!isDocumentEntry(entry)) {
    return null;
  }

  return {
    id: buildDocumentId(entry, index),
    name: buildDocumentLabel(entry),
    type: '',
    uploadedAt:
      typeof entry.document_date === 'string' ? entry.document_date : '',
    tags: mapTags(entry.tags),
    majorHead:
      typeof entry.major_head === 'string' ? entry.major_head : undefined,
    minorHead:
      typeof entry.minor_head === 'string' ? entry.minor_head : undefined,
    remarks:
      typeof entry.document_remarks === 'string'
        ? entry.document_remarks
        : undefined,
    uploadedBy:
      typeof entry.uploaded_by === 'string' ? entry.uploaded_by : undefined,
  };
}

export function mapDocumentsForList(entries) {
  return entries
    .map((entry, index) => mapDocumentForList(entry, index))
    .filter(Boolean);
}
