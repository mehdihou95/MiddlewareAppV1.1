import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { SnackbarProvider } from 'notistack';
import theme from './theme';
import Navigation from './components/Navigation';
import Login from './components/Login';
import FileUpload from './components/FileUpload';
import ProcessedFiles from './components/ProcessedFiles';
import PrivateRoute from './components/PrivateRoute';
import TransformPage from './pages/TransformPage';
import ClientManagementPage from './pages/ClientManagementPage';
import InterfaceManagementPage from './pages/InterfaceManagementPage';
import { AuthProvider } from './context/AuthContext';
import { ClientInterfaceProvider } from './context/ClientInterfaceContext';
import AuditLogs from './components/AuditLogs';
import UserManagement from './components/UserManagement';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Box, CircularProgress } from '@mui/material';

// AppContent component that uses auth context
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Only show Navigation if user is authenticated */}
      {user?.authenticated && <Navigation />}
      <Container sx={{ mt: 4 }}>
        <Routes>
          {/* Public route */}
          <Route 
            path="/login" 
            element={
              user?.authenticated ? <Navigate to="/clients" replace /> : <Login />
            } 
          />
          
          {/* Root route - redirect to login if not authenticated, clients if authenticated */}
          <Route
            path="/"
            element={
              loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : user?.authenticated ? (
                <Navigate to="/clients" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Protected routes */}
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <ProcessedFiles />
              </PrivateRoute>
            }
          />
          <Route
            path="/transform"
            element={
              <PrivateRoute>
                <TransformPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <ClientManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/interfaces"
            element={
              <PrivateRoute>
                <InterfaceManagementPage />
              </PrivateRoute>
            }
          />
          <Route 
            path="/audit-logs" 
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AuditLogs />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
            <Router>
              <ClientInterfaceProvider>
                <AppContent />
              </ClientInterfaceProvider>
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App; 