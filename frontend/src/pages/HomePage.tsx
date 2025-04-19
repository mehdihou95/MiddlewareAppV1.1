import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ListenerIcon from '@mui/icons-material/Settings';
import DispatchIcon from '@mui/icons-material/Send';
import InboundIcon from '@mui/icons-material/Input';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Listener Configuration',
      description: 'Configure and manage message listeners for AS2, SFTP, and API connectors.',
      icon: <ListenerIcon sx={{ fontSize: 60 }} />,
      path: '/listener-config',
      implemented: true
    },
    {
      title: 'Dispatch Configuration',
      description: 'Set up and manage message dispatching rules and configurations.',
      icon: <DispatchIcon sx={{ fontSize: 60 }} />,
      path: '/dispatch-config',
      implemented: false
    },
    {
      title: 'Inbound Configuration',
      description: 'Manage clients, interfaces, transformations, and file uploads.',
      icon: <InboundIcon sx={{ fontSize: 60 }} />,
      path: '/inbound-config',
      implemented: true
    }
  ];

  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: 'calc(100vh - 64px)', // Subtract AppBar height
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        p: 4,
        boxSizing: 'border-box'
      }}
    >
      <Typography 
        variant="h3" 
        gutterBottom 
        align="center" 
        sx={{ 
          mb: 6,
          color: theme.palette.text.primary,
          fontWeight: 500
        }}
      >
        Middleware Management Console
      </Typography>

      <Grid 
        container 
        spacing={4} 
        justifyContent="center"
        sx={{ mt: 2 }}
      >
        {sections.map((section) => (
          <Grid item xs={12} sm={6} md={4} key={section.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                bgcolor: theme.palette.background.paper,
                '&:hover': {
                  transform: section.implemented ? 'scale(1.02)' : 'none',
                  boxShadow: section.implemented ? 8 : 1,
                  cursor: section.implemented ? 'pointer' : 'default'
                },
                opacity: section.implemented ? 1 : 0.7
              }}
              onClick={() => section.implemented && navigate(section.path)}
            >
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText
                }}
              >
                {section.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h2"
                  sx={{ 
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                    mb: 2
                  }}
                >
                  {section.title}
                  {!section.implemented && (
                    <Typography
                      component="span"
                      sx={{
                        ml: 2,
                        px: 1,
                        py: 0.5,
                        bgcolor: theme.palette.grey[300],
                        borderRadius: 1,
                        fontSize: '0.8rem',
                        color: theme.palette.text.secondary
                      }}
                    >
                      Coming Soon
                    </Typography>
                  )}
                </Typography>
                <Typography 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }}
                >
                  {section.description}
                </Typography>
              </CardContent>
              {section.implemented && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ 
                    m: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(section.path);
                  }}
                >
                  Access {section.title}
                </Button>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage; 