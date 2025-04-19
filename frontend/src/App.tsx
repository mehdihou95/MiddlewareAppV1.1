import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { ClientInterfaceProvider } from './context/ClientInterfaceContext';

import SideNavigation from './components/common/SideNavigation';
import Login from './components/common/Login';
import HomePage from './pages/HomePage';
import ApiConfigPage from './pages/listener-config/ApiConfigPage';
import SftpConfigListPage from './pages/listener-config/SftpConfigListPage';
import SftpConfigPage from './pages/listener-config/SftpConfigPage';
import As2ConfigListPage from './pages/listener-config/As2ConfigListPage';
import As2ConfigPage from './pages/listener-config/As2ConfigPage';
import ClientManagementPage from './pages/inbound-config/ClientManagementPage';
import InterfaceManagementPage from './pages/inbound-config/InterfaceManagementPage';
import TransformPage from './pages/inbound-config/TransformPage';
import UploadPage from './pages/inbound-config/UploadPage';
import ProcessedFiles from './components/inbound-config/ProcessedFiles';
import UserManagement from './components/common/UserManagement';
import AuditLogs from './components/common/AuditLogs';
import PrivateRoute from './components/common/PrivateRoute';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <AuthProvider>
            <ClientInterfaceProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes with SideNavigation */}
                <Route element={<PrivateRoute />}>
                  <Route element={<SideNavigation />}>
                    <Route index element={<HomePage />} />
                    <Route path="/" element={<HomePage />} />
                    
                    {/* Listener Configuration */}
                    <Route path="/listener-config">
                      <Route path="sftp" element={<SftpConfigListPage />} />
                      <Route path="sftp/new" element={<SftpConfigPage />} />
                      <Route path="sftp/:id" element={<SftpConfigPage />} />
                      <Route path="as2" element={<As2ConfigListPage />} />
                      <Route path="as2/new" element={<As2ConfigPage />} />
                      <Route path="as2/:id" element={<As2ConfigPage />} />
                      <Route path="api" element={<ApiConfigPage />} />
                    </Route>
                    
                    {/* Inbound Configuration */}
                    <Route path="/inbound-config">
                      <Route index element={<Navigate to="clients" replace />} />
                      <Route path="clients" element={<ClientManagementPage />} />
                      <Route path="interfaces" element={<InterfaceManagementPage />} />
                      <Route path="transform" element={<TransformPage />} />
                      <Route path="upload" element={<UploadPage />} />
                      <Route path="processed-files" element={<ProcessedFiles />} />
                    </Route>
                    
                    {/* Administration */}
                    <Route path="/admin">
                      <Route path="users" element={<UserManagement />} />
                      <Route path="audit-logs" element={<AuditLogs />} />
                    </Route>
                  </Route>
                </Route>
                
                {/* Catch all unmatched routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ClientInterfaceProvider>
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App; 