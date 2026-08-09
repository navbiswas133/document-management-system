function formatDocumentDate(dateString) {
  if (!dateString) {
    return '—';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-GB');
}

function getFileNameFromUrl(fileUrl) {
  if (!fileUrl) {
    return '—';
  }

  try {
    const filename = new URL(fileUrl).pathname.split('/').pop();
    return filename || '—';
  } catch {
    return '—';
  }
}

/**
 * Maps a searchDocumentEntry item to the list row shape used by DocumentList.
 * Fields sourced from the verified API response only.
 */
export function mapDocumentForList(entry) {
  const remarks = entry.document_remarks?.trim();

  return {
    id: entry.document_id,
    name: remarks || getFileNameFromUrl(entry.file_url),
    category: entry.major_head ?? '—',
    department: entry.minor_head ?? '—',
    date: formatDocumentDate(entry.document_date),
    tags: [],
    file_url: entry.file_url,
    document_remarks: entry.document_remarks,
    uploaded_by: entry.uploaded_by,
    upload_time: entry.upload_time,
  };
}
