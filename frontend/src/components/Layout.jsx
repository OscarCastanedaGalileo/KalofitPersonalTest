import * as React from 'react';
import { useState, useEffect } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Tooltip,
} from '@mui/material';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PieChartIcon from '@mui/icons-material/PieChart';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// react-router
import { Outlet, Navigate, useLocation, useNavigate, Link } from 'react-router';
import { backendClient } from '../api/backendClient';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await backendClient.get('/users/me');
        console.log({
          response
        });
        setIsAdmin(response.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    console.log({ path });
    navigate(path);
    handleMenuClose();
  };

  // Rutas del bottom nav
  const tabs = [
    { label: 'Log',     icon: <MenuBookIcon  />,     to: '/foods-list' },
    { label: 'Home',    icon: <PieChartIcon />,     to: '/' },
    { label: 'Reports', icon: <LeaderboardIcon />,  to: '/reports' },
  ];

  // Valor actual = pathname que "matchee" con alguna pestaña
  // pick the most specific matching tab (longest `to`) so '/' doesn't match everything
  const matched = tabs.reduce((best, t) => {
    if (location.pathname.startsWith(t.to) && t.to.length > (best?.to?.length || 0)) {
      return t;
    }
    return best;
  }, null);

  const currentValue = matched?.to || '/';
    // console.log();
  // debugger;
  console.log({
    location,
    currentValue
  })
  return (
    <>
      <Outlet />

      {/* Botón flotante de admin con engrane - solo visible para admins */}
      {isAdmin && (
        <Tooltip title="Panel de Administración">
          <Fab
            color="primary"
            aria-label="admin"
            sx={{
              position: 'fixed',
              bottom: 80, // Por encima del bottom nav
              right: 16,
              zIndex: 1000,
            }}
            onClick={handleMenuClick}
          >
            <SettingsIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Menú desplegable de admin */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick('/categories')}>
          <CategoryIcon sx={{ mr: 1 }} />
          Categorías
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('/users')}>
          <PeopleIcon sx={{ mr: 1 }} />
          Usuarios
        </MenuItem>
      </Menu>

      {/* Barra inferior fija */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation
          showLabels
          value={currentValue}
          onChange={(_, newValue) => navigate(newValue)}
        >
          {tabs.map(t => (
            <BottomNavigationAction
              key={t.to}
              // component={Link}
              label={t.label}
              icon={t.icon}
              value={t.to}
            />
          ))}
        </BottomNavigation>
      </Box>
    </>
  );
}

