import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { isAbortError } from '../../lib/apiResponse';
import {
  buildStatCards,
  loadDashboardStats,
} from './dashboardStatsFeature';

export function useDashboardStats() {
  const token = useSelector((state) => state.auth.token);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStats(null);
      setError('');
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function fetchStats() {
      setIsLoading(true);
      setError('');

      try {
        const nextStats = await loadDashboardStats({
          signal: controller.signal,
        });

        if (!cancelled) {
          setStats(nextStats);
        }
      } catch (fetchError) {
        if (!cancelled && !isAbortError(fetchError)) {
          setStats(null);
          setError('failed');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [token]);

  const statCards = useMemo(
    () => buildStatCards(stats, { isLoading, error }),
    [stats, isLoading, error],
  );

  return { statCards, stats, isLoading, error };
}
