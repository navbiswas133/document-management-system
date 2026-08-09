import api from '../../lib/axios';

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
  return null;
}

export function searchDocuments(requestBody = DEFAULT_SEARCH_REQUEST_BODY, token) {
  if (!token) {
    return Promise.reject(
      new Error('Document search requires a token header.'),
    );
  }

  return api.post('/searchDocumentEntry', requestBody, {
    headers: {
      token,
    },
  });
}
