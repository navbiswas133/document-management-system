export function parseDocumentTagsResponse(responseData) {
  const data = responseData?.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      return item?.label ?? item?.tag_name ?? '';
    })
    .map((tag) => tag.trim())
    .filter(Boolean);
}
