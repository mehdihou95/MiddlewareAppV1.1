import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SftpConfigForm from '../../components/listener-config/connectors/sftp/forms/SftpConfigForm';

const SftpConfigPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/listener-config" color="inherit">
            Listener Configuration
          </Link>
          <Typography color="text.primary">SFTP Configuration</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Typography variant="h4" component="h1" gutterBottom>
          SFTP Connection Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Configure SFTP connection settings for automated file reception. This includes connection details,
          security settings, directory configurations, and operational parameters.
        </Typography>

        {/* Configuration Form */}
        <Box sx={{ mt: 4 }}>
          <SftpConfigForm />
        </Box>
      </Box>
    </Container>
  );
};

export default SftpConfigPage; 