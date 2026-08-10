import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../lib/axios');

import {
  getMockApiPost,
  mockApiSuccess,
  mockApiFailure,
} from '../../../test/mockApiClient';

vi.mock('../../auth/authStorage', () => ({
  getAuthToken: vi.fn(() => 'mock-session-token'),
}));

import {
  buildSearchRequestBody,
  searchDocuments,
  fetchDocumentTagEntries,
  saveDocumentEntry,
} from '../documentsApi';

const SEARCH_BODY = buildSearchRequestBody({
  searchValue: 'report',
  majorHead: 'Personal',
  minorHead: 'John',
  tags: ['finance', 'tax'],
  fromDate: '2024-01-01',
  toDate: '2024-01-31',
  start: 0,
  length: 10,
});

const SEARCH_SUCCESS = {
  status: true,
  recordsTotal: 1,
  data: [
    {
      document_id: 'doc-1',
      major_head: 'Personal',
      minor_head: 'John',
      document_date: '2024-01-15',
      file_url: 'https://example.com/files/sample.pdf',
      document_remarks: 'Sample document',
      total_count: 1,
    },
  ],
};

describe('documentsApi', () => {
  beforeEach(() => {
    getMockApiPost().mockReset();
  });

  describe('searchDocuments', () => {
    it('posts search body with token header', async () => {
      mockApiSuccess(SEARCH_SUCCESS);

      const result = await searchDocuments(SEARCH_BODY);

      expect(getMockApiPost()).toHaveBeenCalledWith(
        '/searchDocumentEntry',
        SEARCH_BODY,
        expect.objectContaining({
          headers: { token: 'mock-session-token' },
        }),
      );
      expect(result).toEqual(SEARCH_SUCCESS);
    });

    it('throws when status is false', async () => {
      mockApiFailure('Unable to search');

      await expect(searchDocuments(SEARCH_BODY)).rejects.toThrow('Unable to search');
    });
  });

  describe('fetchDocumentTagEntries', () => {
    it('posts term with token header', async () => {
      mockApiSuccess({
        status: true,
        data: [{ label: 'finance', id: 'finance' }],
      });

      const result = await fetchDocumentTagEntries('fin');

      expect(getMockApiPost()).toHaveBeenCalledWith(
        '/documentTags',
        { term: 'fin' },
        expect.objectContaining({
          headers: { token: 'mock-session-token' },
        }),
      );
      expect(result).toEqual([
        { id: 'finance', label: 'finance', count: null },
      ]);
    });

    it('throws when status is false', async () => {
      mockApiFailure('Tags unavailable');

      await expect(fetchDocumentTagEntries('fin')).rejects.toThrow('Tags unavailable');
    });
  });

  describe('saveDocumentEntry', () => {
    it('posts FormData with file and data plus token header', async () => {
      mockApiSuccess({ status: true, message: 'Document saved' });

      const file = new File(['content'], 'sample.pdf', { type: 'application/pdf' });

      const result = await saveDocumentEntry({
        file,
        majorHead: 'Personal',
        minorHead: 'John',
        documentDate: '2024-01-15',
        remarks: 'Notes',
        tags: ['finance'],
        userId: 'user-1',
      });

      expect(getMockApiPost()).toHaveBeenCalledOnce();
      const [endpoint, formData, config] = getMockApiPost().mock.calls[0];

      expect(endpoint).toBe('/saveDocumentEntry');
      expect(config).toEqual(expect.objectContaining({
        headers: { token: 'mock-session-token' },
      }));
      expect(formData.get('file')).toBe(file);

      const payload = JSON.parse(formData.get('data'));
      expect(payload).toEqual({
        major_head: 'Personal',
        minor_head: 'John',
        document_date: '2024-01-15',
        document_remarks: 'Notes',
        tags: [{ tag_name: 'finance' }],
        user_id: 'user-1',
      });
      expect(result).toEqual({ status: true, message: 'Document saved' });
    });

    it('throws when status is false', async () => {
      mockApiFailure('Upload rejected');

      const file = new File(['content'], 'sample.pdf', { type: 'application/pdf' });

      await expect(
        saveDocumentEntry({
          file,
          majorHead: 'Personal',
          minorHead: 'John',
          documentDate: '2024-01-15',
          remarks: '',
          tags: ['finance'],
          userId: 'user-1',
        }),
      ).rejects.toThrow('Upload rejected');
    });
  });
});
