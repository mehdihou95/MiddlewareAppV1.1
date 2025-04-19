import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Divider, IconButton, Menu, MenuItem, Chip, ListItem, ListItemIcon, ListItemText, List } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BrushIcon from '@mui/icons-material/Brush';
import TransformIcon from '@mui/icons-material/Transform';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../context/AuthContext';
import HistoryIcon from '@mui/icons-material/History';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useClientInterface } from '../../context/ClientInterfaceContext';
import { People as PeopleIcon, Code as CodeIcon } from '@mui/icons-material';
import { Drawer, useMediaQuery, useTheme } from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    Api as ApiIcon,
    CloudUpload as CloudUploadIcon,
    Assessment as AssessmentIcon,
    Person as PersonIcon,
    Queue as QueueIcon,
    Monitor as MonitorIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const Navigation: React.FC = () => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    clients, 
    interfaces, 
    selectedClient, 
    selectedInterface,
    setSelectedClient,
    setSelectedInterface
  } = useClientInterface();
  
  const [clientMenuAnchor, setClientMenuAnchor] = useState<null | HTMLElement>(null);
  const [interfaceMenuAnchor, setInterfaceMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClientMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setClientMenuAnchor(event.currentTarget);
  };

  const handleClientMenuClose = () => {
    setClientMenuAnchor(null);
  };

  const handleInterfaceMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setInterfaceMenuAnchor(event.currentTarget);
  };

  const handleInterfaceMenuClose = () => {
    setInterfaceMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    handleClientMenuClose();
  };

  const handleInterfaceSelect = (interfaceObj: any) => {
    setSelectedInterface(interfaceObj);
    handleInterfaceMenuClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleUserMenuClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Listener Config', icon: <SettingsIcon />, path: '/listener-config' },
    { text: 'Queue Management', icon: <QueueIcon />, path: '/queue' },
    { text: 'Monitoring', icon: <MonitorIcon />, path: '/monitoring' },
    { text: 'API Documentation', icon: <CodeIcon />, path: '/api-docs' },
  ];

  const settingsItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'API Configuration', icon: <ApiIcon />, path: '/listener-config/api' },
    { text: 'User Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Middleware App
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {settingsItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  if (!user?.authenticated) {
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            XML Processor
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/login"
            startIcon={<LoginIcon />}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>
    );
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
            XML Processor
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
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
          <Toolbar />
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Drawer
          variant="permanent"
              sx={{ 
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <Toolbar />
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>
          </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
          </Box>
        </Box>
  );
};

export default Navigation; 