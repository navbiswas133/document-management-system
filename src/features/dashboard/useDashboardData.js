import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { isAbortError } from '../../lib/apiResponse';
import {
  buildDashboardStatCards,
  clearDashboardDataCache,
  loadDashboardData,
} from './dashboardDataFeature';

export function useDashboardData() {
  const token = useSelector((state) => state.auth.token);
  const [stats, setStats] = useState(null);
  const [topTags, setTopTags] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      clearDashboardDataCache();
      setStats(null);
      setTopTags([]);
      setRecentDocuments([]);
      setError('');
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function fetchDashboardData() {
      setIsLoading(true);
      setError('');

      try {
        const data = await loadDashboardData();

        if (!cancelled) {
          setStats(data.stats);
          setTopTags(data.topTags);
          setRecentDocuments(data.recentDocuments);
        }
      } catch (fetchError) {
        if (!cancelled && !isAbortError(fetchError)) {
          clearDashboardDataCache();
          setStats(null);
          setTopTags([]);
          setRecentDocuments([]);
          setError('failed');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const statCards = useMemo(
    () => buildDashboardStatCards(stats, { isLoading, error }),
    [stats, isLoading, error],
  );

  return {
    statCards,
    stats,
    topTags,
    recentDocuments,
    isLoading,
    isLoadingStats: isLoading,
    isLoadingTopTags: isLoading,
    isLoadingRecentDocuments: isLoading,
    error,
    hasStatsError: Boolean(error),
    hasTopTagsError: Boolean(error),
    hasRecentDocumentsError: Boolean(error),
  };
}
