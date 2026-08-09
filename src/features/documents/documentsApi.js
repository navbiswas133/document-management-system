import api from '../../lib/axios';
import { ApiResponseError, getResponseErrorMessage } from '../../lib/apiResponse';
import { getAuthToken } from '../auth/authStorage';
import { parseSearchDocumentResponse } from './searchDocumentResponse';

export const PAGE_SIZE = 10;

export const DEFAULT_SEARCH_REQUEST_BODY = {
  major_head: '',
  minor_head: '',
  from_date: '',
  to_date: '',
  tags: [{ tag_name: '' }, { tag_name: '' }],
  uploaded_by: '',
  start: 0,
  length: 10,
  filterId: '',
  search: {
    value: '',
  },
};

export function getDocumentApiToken() {
  return getAuthToken();
}

export function buildSearchRequestBody({
  searchValue = '',
  tag = '',
  majorHead = '',
  filterId = '',
  start = 0,
  length = PAGE_SIZE,
} = {}) {
  return {
    major_head: majorHead,
    minor_head: '',
    from_date: '',
    to_date: '',
    tags: [{ tag_name: tag }, { tag_name: '' }],
    uploaded_by: '',
    start,
    length,
    filterId,
    search: {
      value: searchValue,
    },
  };
}

export async function fetchDocumentById(documentId) {
  const responseData = await searchDocuments(
    buildSearchRequestBody({ filterId: String(documentId) }),
  );

  const { documents } = parseSearchDocumentResponse(responseData);

  return (
    documents.find((doc) => String(doc.id) === String(documentId)) ??
    documents[0] ??
    null
  );
}

export async function searchDocuments(requestBody = DEFAULT_SEARCH_REQUEST_BODY) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Document search requires authentication.');
  }

  const response = await api.post('/searchDocumentEntry', requestBody, {
    headers: {
      token,
    },
  });

  if (!response.data?.status) {
    throw new ApiResponseError(
      getResponseErrorMessage(response.data, 'Unable to load documents.'),
    );
  }

  return response.data;
}
