import api from '../../lib/axios';
import { ApiResponseError, getResponseErrorMessage } from '../../lib/apiResponse';
import { withInflightDedup } from '../../lib/requestDedup';
import { withServiceRetry } from '../../lib/retryRequest';
import { getAuthToken } from '../auth/authStorage';
import { parseDocumentTagEntries } from './documentTagsResponse';
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

export async function fetchAllSearchDocuments(getRequestBody, totalHint) {
  if (totalHint === 0) {
    return [];
  }

  if (totalHint) {
    const bulkResponse = await searchDocuments(
      getRequestBody(0, totalHint),
    );
    const { documents: bulkDocuments, total } = parseSearchDocumentResponse(
      bulkResponse,
    );

    if (bulkDocuments.length >= total || bulkDocuments.length >= totalHint) {
      return bulkDocuments;
    }

    const allDocuments = [...bulkDocuments];
    const remainingTotal = total;

    const restStarts = [];

    for (let start = bulkDocuments.length; start < remainingTotal; start += PAGE_SIZE) {
      restStarts.push(start);
    }

    const pageResults = await Promise.all(
      restStarts.map(async (start) => {
        const batchLength = Math.min(PAGE_SIZE, remainingTotal - start);
        const response = await searchDocuments(
          getRequestBody(start, batchLength),
        );
        return parseSearchDocumentResponse(response).documents;
      }),
    );

    allDocuments.push(...pageResults.flat());

    return allDocuments;
  }

  const allDocuments = [];
  let start = 0;
  let total = null;

  while (true) {
    const response = await searchDocuments(getRequestBody(start, PAGE_SIZE));
    const { documents, total: responseTotal } = parseSearchDocumentResponse(
      response,
    );

    if (total === null) {
      total = responseTotal;
    }

    allDocuments.push(...documents);

    if (allDocuments.length >= total || documents.length < PAGE_SIZE) {
      break;
    }

    start += documents.length;
  }

  return allDocuments;
}

export async function searchDocuments(
  requestBody = DEFAULT_SEARCH_REQUEST_BODY,
  options = {},
) {
  const execute = () =>
    withServiceRetry(async () => {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Document search requires authentication.');
      }

      const response = await api.post('/searchDocumentEntry', requestBody, {
        headers: {
          token,
        },
        signal: options.signal,
        skipErrorToast: options.skipErrorToast,
      });

      if (!response.data?.status) {
        throw new ApiResponseError(
          getResponseErrorMessage(response.data, 'Unable to load documents.'),
        );
      }

      return response.data;
    });

  if (options.signal) {
    return execute();
  }

  const requestKey = `search:${JSON.stringify(requestBody)}`;

  return withInflightDedup(requestKey, execute);
}

export async function fetchDocumentTagEntries(term = '', options = {}) {
  const execute = () =>
    withServiceRetry(async () => {
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
          signal: options.signal,
          skipErrorToast: options.skipErrorToast,
        },
      );

      if (!response.data?.status) {
        throw new ApiResponseError(
          getResponseErrorMessage(response.data, 'Unable to load tags.'),
        );
      }

      return parseDocumentTagEntries(response.data);
    });

  if (options.signal) {
    return execute();
  }

  const requestKey = `documentTags:${term}`;

  return withInflightDedup(requestKey, execute);
}

export async function fetchDocumentTags(term = '') {
  const entries = await fetchDocumentTagEntries(term);
  return entries.map((tag) => tag.label);
}

export async function saveDocumentEntry({
  file,
  majorHead,
  minorHead,
  documentDate,
  remarks,
  tags,
  userId,
}) {
  return withServiceRetry(async () => {
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
  });
}
