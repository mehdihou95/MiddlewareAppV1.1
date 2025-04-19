import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { CheckCircle, Error, Pending } from '@mui/icons-material';
import { ConnectorStatus } from '../../../services/monitoring/MonitoringService';

interface StatusIndicatorProps {
  status: ConnectorStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status.status) {
      case 'connected':
        return 'success.main';
      case 'error':
        return 'error.main';
      case 'disconnected':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'connected':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'disconnected':
        return <Pending />;
      default:
        return <Pending />;
    }
  };

  return (
    <Tooltip
      title={
        status.errorMessage
          ? `Error: ${status.errorMessage}`
          : `Last checked: ${new Date(status.lastChecked).toLocaleString()}`
      }
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: getStatusColor(),
        }}
      >
        {getStatusIcon()}
        <Typography variant="body2">
          {status.name} ({status.type})
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default StatusIndicator; 