import React, { useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router';
import { getCustomTheme } from './theme';
import { ColorModeContext } from './context/ColorModeContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';

// 2. Componente principal que maneja el estado del tema
export function RootProvider({ router }) {
  const [mode, setMode] = useState('dark'); // Estado inicial: 'light'

  // Lógica para alternar el modo
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      currentMode: mode, // Opcional: para acceder al modo actual
    }),
    [mode],
  );

  // Generar el tema basado en el estado (solo se recalcula si 'mode' cambia)
  const theme = useMemo(() => getCustomTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* Aplica el background.default y resetea estilos */}
        <CssBaseline />
        <ProfileProvider>
          {/* El RouterProvider está envuelto por el ProfileProvider */}
          <RouterProvider router={router} />
        </ProfileProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
