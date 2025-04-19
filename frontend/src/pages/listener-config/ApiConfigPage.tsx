import React from 'react';
import { Container, Typography, Box, Paper, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ApiConfigForm from '../../components/listener-config/connectors/api/forms/ApiConfigForm';

const ApiConfigPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/listener-config" color="inherit">
            Listener Configuration
          </Link>
          <Typography color="text.primary">API Configuration</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            API Configuration
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Configure the API connection settings for the listener service.
          </Typography>
          <ApiConfigForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default ApiConfigPage; 