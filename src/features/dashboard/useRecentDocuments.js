import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isAbortError } from '../../lib/apiResponse';
import { loadRecentDocuments } from './recentDocumentsFeature';

export function useRecentDocuments() {
  const token = useSelector((state) => state.auth.token);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setRecentDocuments([]);
      setError('');
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function fetchRecentDocuments() {
      setIsLoading(true);
      setError('');

      try {
        const documents = await loadRecentDocuments();

        if (!cancelled) {
          setRecentDocuments(documents);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setRecentDocuments([]);
          setError(isAbortError(fetchError) ? '' : 'failed');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchRecentDocuments();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { recentDocuments, isLoading, error };
}
