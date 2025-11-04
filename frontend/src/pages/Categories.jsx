import React from 'react';
import { Box, Typography } from '@mui/material';
import CategoriesGrid from '../components/CategoriesGrid.jsx';

export default function Categories() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de categorías
      </Typography>
      <CategoriesGrid />
    </Box>
  );
}
