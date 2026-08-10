import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isAbortError } from '../../lib/apiResponse';
import { loadTopTags } from './topTagsFeature';

export function useTopTags() {
  const token = useSelector((state) => state.auth.token);
  const [topTags, setTopTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setTopTags([]);
      setError('');
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function fetchTopTags() {
      setIsLoading(true);
      setError('');

      try {
        const tags = await loadTopTags();

        if (!cancelled) {
          setTopTags(tags);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setTopTags([]);
          setError(isAbortError(fetchError) ? '' : 'failed');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTopTags();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { topTags, isLoading, error };
}
