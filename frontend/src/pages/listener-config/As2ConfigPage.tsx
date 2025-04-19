import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { As2ConfigForm } from '../../components/listener-config/connectors/as2/forms/As2ConfigForm';

const As2ConfigPage: React.FC = () => {
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
          <Typography color="text.primary">AS2 Configuration</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Typography variant="h4" component="h1" gutterBottom>
          AS2 Connection Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Configure AS2 connection settings for automated file reception. This includes partner details,
          security settings, MDN configuration, and operational parameters.
        </Typography>

        {/* Configuration Form */}
        <Box sx={{ mt: 4 }}>
          <As2ConfigForm />
        </Box>
      </Box>
    </Container>
  );
};

export default As2ConfigPage; 