import React, { createContext } from 'react';

// Crear y exportar el Contexto del Modo de Color
export const ColorModeContext = createContext({ toggleColorMode: () => {} });
