import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import UsersGrid from '../components/UsersGrid';

const Users = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <UsersGrid />
      </Box>
    </Container>
  );
};

export default Users;
