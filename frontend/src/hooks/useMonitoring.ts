import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ConnectorStatus } from '../types/connectors';

interface MetricsData {
    timestamp: number;
    messagesProcessed: number;
    errors: number;
    processingTime: number;
}

interface UseMonitoringReturn {
    statuses: ConnectorStatus[];
    metrics: Record<string, MetricsData[]>;
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
}

export function useMonitoring(): UseMonitoringReturn {
    const [statuses, setStatuses] = useState<ConnectorStatus[]>([]);
    const [metrics, setMetrics] = useState<Record<string, MetricsData[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [statusesResponse, metricsResponse] = await Promise.all([
                api.get<ConnectorStatus[]>('/api/monitoring/status'),
                api.get<Record<string, MetricsData[]>>('/api/monitoring/metrics'),
            ]);

            setStatuses(statusesResponse.data);
            setMetrics(metricsResponse.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        statuses,
        metrics,
        loading,
        error,
        refreshData: fetchData,
    };
} 