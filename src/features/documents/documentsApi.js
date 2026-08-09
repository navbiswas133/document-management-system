import api from '../../lib/axios';

export function searchDocuments(params) {
  return api.post('/searchDocumentEntry', params);
}
