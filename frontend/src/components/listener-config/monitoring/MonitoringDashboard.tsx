import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    Typography,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { ConnectorStatus } from '../../../types/connectors';
import { useMonitoring } from '../../../hooks/useMonitoring';
import MetricsChart, { MetricsData } from './MetricsChart';
import AlertConfigDialog from './AlertConfigDialog';

interface MonitoringDashboardProps {
    statuses: ConnectorStatus[];
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ statuses }) => {
    const [alertConfigOpen, setAlertConfigOpen] = useState(false);
    const { metrics, loading } = useMonitoring();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONNECTED':
                return <CheckCircleIcon />;
            case 'ERROR':
                return <ErrorIcon />;
            case 'DISCONNECTED':
                return <WarningIcon />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONNECTED':
                return 'success';
            case 'ERROR':
                return 'error';
            case 'DISCONNECTED':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatMetricsData = (rawMetrics: any): Record<string, MetricsData[]> => {
        if (!rawMetrics) return {};
        
        return {
            'Messages Processed': rawMetrics.messagesProcessed?.map((m: any) => ({
                timestamp: m.timestamp,
                value: m.value,
            })) || [],
            'Errors': rawMetrics.errors?.map((m: any) => ({
                timestamp: m.timestamp,
                value: m.value,
            })) || [],
            'Processing Time': rawMetrics.processingTime?.map((m: any) => ({
                timestamp: m.timestamp,
                value: m.value,
            })) || [],
        };
    };

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Connector Status
                    </Typography>
                    <Grid container spacing={2}>
                        {statuses.map((status) => (
                            <Grid item key={status.id}>
                                <Chip
                                    icon={getStatusIcon(status.status) as React.ReactElement}
                                    label={status.status}
                                    color={getStatusColor(status.status)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                {metrics && Object.keys(metrics).length > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Performance Metrics
                        </Typography>
                        <MetricsChart 
                            data={formatMetricsData(metrics)} 
                            onClose={() => {}} 
                        />
                    </Grid>
                )}
            </Grid>

            <AlertConfigDialog
                open={alertConfigOpen}
                onClose={() => setAlertConfigOpen(false)}
                onSave={(config) => {
                    // Handle saving alert configuration
                    setAlertConfigOpen(false);
                }}
            />
        </Box>
    );
};

export default MonitoringDashboard; 