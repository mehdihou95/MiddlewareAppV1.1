import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useMonitoring } from '../../../context/MonitoringContext';
import StatusIndicator from './StatusIndicator';
import MetricsChart from './MetricsChart';
import AlertConfigDialog from './AlertConfigDialog';
import { ConnectorStatus, PerformanceMetrics } from '../../../services/monitoring/MonitoringService';

interface MonitoringDashboardProps {
    initialData?: {
        connectorStatuses: ConnectorStatus[];
        performanceMetrics: PerformanceMetrics[];
    };
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ initialData }) => {
    const {
        connectorStatuses,
        performanceMetrics,
        isLoading,
        error,
        refreshData
    } = useMonitoring();

    const [isAlertDialogOpen, setIsAlertDialogOpen] = React.useState(false);
    const [isMetricsVisible, setIsMetricsVisible] = React.useState(true);

    const handleRefresh = () => {
        refreshData();
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error.message}
            </Alert>
        );
    }

    const currentMetrics = performanceMetrics || initialData?.performanceMetrics || [];
    const currentStatuses = connectorStatuses || initialData?.connectorStatuses || [];

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Monitoring Dashboard</Typography>
                <Box>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        sx={{ mr: 2 }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setIsAlertDialogOpen(true)}
                    >
                        Configure Alerts
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Connector Status Section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Connector Status
                        </Typography>
                        <Grid container spacing={2}>
                            {currentStatuses.map((status) => (
                                <Grid item xs={12} sm={6} md={4} key={status.id}>
                                    <StatusIndicator status={status} />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Performance Metrics Section */}
                {isMetricsVisible && currentMetrics.length > 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Performance Metrics
                            </Typography>
                            <MetricsChart 
                                data={currentMetrics}
                                onClose={() => setIsMetricsVisible(false)}
                            />
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <AlertConfigDialog
                open={isAlertDialogOpen}
                onClose={() => setIsAlertDialogOpen(false)}
            />
        </Box>
    );
};

export default MonitoringDashboard; 