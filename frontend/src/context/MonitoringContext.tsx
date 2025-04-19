import React, { createContext, useContext, useEffect, useState } from 'react';
import { monitoringService, MonitoringData, ConnectorStatus, PerformanceMetrics } from '../services/monitoring/MonitoringService';

interface MonitoringContextType {
  connectorStatuses: ConnectorStatus[];
  performanceMetrics: PerformanceMetrics[];
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<MonitoringData>({
    connectorStatuses: [],
    performanceMetrics: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newData = await monitoringService.fetchInitialData();
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch monitoring data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    monitoringService.connectWebSocket();

    const unsubscribe = monitoringService.subscribe((newData) => {
      setData(newData);
    });

    return () => {
      unsubscribe();
      monitoringService.disconnect();
    };
  }, []);

  return (
    <MonitoringContext.Provider
      value={{
        connectorStatuses: data.connectorStatuses,
        performanceMetrics: data.performanceMetrics,
        isLoading,
        error,
        refreshData
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (context === undefined) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
}; 