import api from '../../lib/axios';
import { ApiResponseError, getResponseErrorMessage } from '../../lib/apiResponse';
import { getAuthToken } from '../auth/authStorage';
import { parseDocumentTagsResponse } from './documentTagsResponse';
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
  majorHead = '',
  minorHead = '',
  tags = ['', ''],
  fromDate = '',
  toDate = '',
  filterId = '',
  start = 0,
  length = PAGE_SIZE,
} = {}) {
  const [tag1 = '', tag2 = ''] = tags;

  return {
    major_head: majorHead,
    minor_head: minorHead,
    from_date: fromDate,
    to_date: toDate,
    tags: [{ tag_name: tag1 }, { tag_name: tag2 }],
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

export async function searchDocuments(
  requestBody = DEFAULT_SEARCH_REQUEST_BODY,
  options = {},
) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Document search requires authentication.');
  }

  const response = await api.post('/searchDocumentEntry', requestBody, {
    headers: {
      token,
    },
    signal: options.signal,
  });

  if (!response.data?.status) {
    throw new ApiResponseError(
      getResponseErrorMessage(response.data, 'Unable to load documents.'),
    );
  }

  return response.data;
}

export async function fetchDocumentTags(term = '') {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Document tags require authentication.');
  }

  const response = await api.post(
    '/documentTags',
    { term },
    {
      headers: {
        token,
      },
    },
  );

  if (!response.data?.status) {
    throw new ApiResponseError(
      getResponseErrorMessage(response.data, 'Unable to load tags.'),
    );
  }

  return parseDocumentTagsResponse(response.data);
}

export async function uploadDocumentEntry({
  file,
  majorHead,
  minorHead,
  documentDate,
  remarks,
  tags,
  userId,
}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Document upload requires authentication.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'data',
    JSON.stringify({
      major_head: majorHead,
      minor_head: minorHead,
      document_date: documentDate,
      document_remarks: remarks,
      tags: tags.map((tagName) => ({ tag_name: tagName })),
      user_id: userId,
    }),
  );

  const response = await api.post('/saveDocumentEntry', formData, {
    headers: {
      token,
    },
  });

  if (!response.data?.status) {
    throw new ApiResponseError(
      getResponseErrorMessage(response.data, 'Unable to upload document.'),
    );
  }

  return response.data;
}
