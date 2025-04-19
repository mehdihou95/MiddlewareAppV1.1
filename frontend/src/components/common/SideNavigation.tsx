import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Api as ApiIcon,
  CloudUpload as CloudUploadIcon,
  Transform as TransformIcon,
  People as PeopleIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Send as SendIcon,
  SwapHoriz as SwapHorizIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const SideNavigation: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <DashboardIcon />, path: '/' },
    {
      text: 'Listener Configuration',
      icon: <SettingsIcon />,
      children: [
        { text: 'API Configuration', icon: <ApiIcon />, path: '/listener-config/api' },
        { text: 'SFTP Configuration', icon: <StorageIcon />, path: '/listener-config/sftp' },
        { text: 'AS2 Configuration', icon: <SwapHorizIcon />, path: '/listener-config/as2' },
      ]
    },
    {
      text: 'Inbound Configuration',
      icon: <CloudUploadIcon />,
      children: [
        { text: 'Clients', icon: <PeopleIcon />, path: '/inbound-config/clients' },
        { text: 'Interfaces', icon: <CodeIcon />, path: '/inbound-config/interfaces' },
        { text: 'Transform', icon: <TransformIcon />, path: '/inbound-config/transform' },
        { text: 'Upload', icon: <CloudUploadIcon />, path: '/inbound-config/upload' },
        { text: 'Processed Files', icon: <AssessmentIcon />, path: '/inbound-config/processed-files' },
      ]
    },
    {
      text: 'Dispatch Configuration',
      icon: <SendIcon />,
      disabled: true,
      path: '/dispatch-config'
    },
    {
      text: 'Administration',
      icon: <SecurityIcon />,
      children: [
        { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Audit Logs', icon: <AssessmentIcon />, path: '/admin/audit-logs' }
      ]
    }
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Middleware Console
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          item.children ? (
            <React.Fragment key={item.text}>
              <ListItem>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ color: item.disabled ? 'text.disabled' : 'text.primary' }}
                />
              </ListItem>
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <ListItem
                    button
                    key={child.text}
                    component={RouterLink}
                    to={child.path}
                    selected={location.pathname === child.path}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>{child.icon}</ListItemIcon>
                    <ListItemText primary={child.text} />
                  </ListItem>
                ))}
              </List>
            </React.Fragment>
          ) : (
            <ListItem
              button
              key={item.text}
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              disabled={item.disabled}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          )
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  if (!user?.authenticated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {menuItems.find(item => 
              item.path === location.pathname || 
              item.children?.some(child => child.path === location.pathname)
            )?.text || 'Middleware App'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: '64px', // Height of AppBar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default SideNavigation;