export function parseDocumentTagsResponse(responseData) {
  const data = responseData?.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => (typeof item === 'string' ? item : item?.tag_name))
    .filter(Boolean);
}
