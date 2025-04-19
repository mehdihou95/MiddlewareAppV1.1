import React from 'react';
import {
    Box,
    Card,
    CardContent,
    IconButton,
    Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { PerformanceMetrics } from '../../../services/monitoring/MonitoringService';

interface MetricsChartProps {
    data: PerformanceMetrics[];
    onClose: () => void;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ data, onClose }) => {
    const formatData = (metrics: PerformanceMetrics[]) => {
        return metrics.map(metric => ({
            ...metric,
            timestamp: new Date(metric.timestamp).toLocaleTimeString(),
            messageRate: metric.messageCount / (metric.averageProcessingTime || 1),
        }));
    };

    const chartData = formatData(data);

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Performance Metrics</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="messageCount"
                                stroke="#8884d8"
                                name="Messages"
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="errorCount"
                                stroke="#ff7300"
                                name="Errors"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="averageProcessingTime"
                                stroke="#82ca9d"
                                name="Avg Processing Time (ms)"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="messageRate"
                                stroke="#ffc658"
                                name="Message Rate (msg/s)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MetricsChart; 