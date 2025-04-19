import axios from 'axios';
import { ConnectorType } from '../../types/connectors';

export interface ConnectorStatus {
  id: string;
  type: ConnectorType;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastChecked: Date;
  errorMessage?: string;
}

export interface PerformanceMetrics {
  connectorId: string;
  timestamp: Date;
  messageCount: number;
  errorCount: number;
  averageProcessingTime: number;
  activeConnections: number;
}

export interface MonitoringData {
  connectorStatuses: ConnectorStatus[];
  performanceMetrics: PerformanceMetrics[];
}

class MonitoringService {
  private static instance: MonitoringService;
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private subscribers: ((data: MonitoringData) => void)[] = [];

  private constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public async fetchInitialData(): Promise<MonitoringData> {
    try {
      const [statusResponse, metricsResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/api/monitoring/status`),
        axios.get(`${this.baseUrl}/api/monitoring/metrics`)
      ]);

      return {
        connectorStatuses: statusResponse.data,
        performanceMetrics: metricsResponse.data
      };
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      throw new Error('Failed to fetch monitoring data');
    }
  }

  public connectWebSocket(): void {
    if (this.wsConnection) {
      return;
    }

    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws/monitoring`;
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as MonitoringData;
        this.notifySubscribers(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.reconnectWebSocket();
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket connection closed');
      this.reconnectWebSocket();
    };
  }

  private reconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    setTimeout(() => this.connectWebSocket(), 5000);
  }

  public subscribe(callback: (data: MonitoringData) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(data: MonitoringData): void {
    this.subscribers.forEach(callback => callback(data));
  }

  public disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

export const monitoringService = MonitoringService.getInstance(); 