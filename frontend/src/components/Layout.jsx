import * as React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PieChartIcon from '@mui/icons-material/PieChart';

// react-router
import { Outlet, Navigate, useLocation, useNavigate, Link } from 'react-router';
// (si usas react-router v6, asegúrate de importar desde 'react-router-dom')

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Rutas del bottom nav
  const tabs = [
    { label: 'Log',     icon: <MenuBookIcon  />,     to: '/foods-list' },
    { label: 'Home',    icon: <PieChartIcon />,     to: '/' },
    { label: 'Reports', icon: <LeaderboardIcon />,  to: '/reports' },
  ];

  // Valor actual = pathname que “matchee” con alguna pestaña
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

