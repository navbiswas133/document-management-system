function getTagLabel(item) {
  if (typeof item === 'string') {
    return item.trim();
  }

  return String(item?.label ?? item?.tag_name ?? item?.id ?? '').trim();
}

function getTagId(item, label) {
  if (typeof item === 'string') {
    return label;
  }

  const id = String(item?.id ?? '').trim();
  return id || label;
}

function getTagCount(item) {
  if (typeof item === 'string') {
    return null;
  }

  const candidates = [
    item?.count,
    item?.document_count,
    item?.tag_count,
    item?.total_count,
    item?.value,
  ];

  for (const candidate of candidates) {
    const parsed = Number(candidate);

    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return null;
}

export function parseDocumentTagEntries(responseData) {
  const data = responseData?.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      const label = getTagLabel(item);

      if (!label) {
        return null;
      }

      return {
        id: getTagId(item, label),
        label,
        count: getTagCount(item),
      };
    })
    .filter(Boolean);
}

export function parseDocumentTagsResponse(responseData) {
  return parseDocumentTagEntries(responseData).map((tag) => tag.label);
}
