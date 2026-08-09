import api from '../../lib/axios';

export const DEFAULT_SEARCH_PARAMS = {
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

export function searchDocuments(params = DEFAULT_SEARCH_PARAMS, token) {
  const headers = {};

  if (token) {
    headers.token = token;
  }

  return api.post('/searchDocumentEntry', params, { headers });
}
