import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useMediaQuery,
  useTheme,
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import { backendClient } from '../api/backendClient';
import dayjs from 'dayjs';

const UsersGrid = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'basic',
    isConfirmed: false,
  });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await backendClient.get('/users');

      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setSnackbar({ open: true, message: 'Error al cargar usuarios', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await backendClient.get('/users/me');
      setCurrentUserId(response.id);
    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUserId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'basic',
      isConfirmed: user?.isConfirmed || false,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'basic', isConfirmed: false });
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Update user
        await backendClient.put(`/users/${editingUser.id}`, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isConfirmed: formData.isConfirmed,
        });
        setSnackbar({ open: true, message: 'Usuario actualizado exitosamente', severity: 'success' });
      } else {
        // Create user
        await backendClient.post('/users', formData);
        setSnackbar({ open: true, message: 'Usuario creado exitosamente', severity: 'success' });
      }
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      const message = error.response?.data?.error || 'Error al guardar usuario';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
    try {
      await backendClient.delete(`/users/${userId}`);
      setSnackbar({ open: true, message: 'Usuario eliminado exitosamente', severity: 'success' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      const message = error.response?.data?.error || 'Error al eliminar usuario';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleRestore = async (userId) => {
    try {
      await backendClient.post(`/users/${userId}/restore`);
      setSnackbar({ open: true, message: 'Usuario restaurado exitosamente', severity: 'success' });
      fetchUsers();
    } catch (error) {
      console.error('Error restoring user:', error);
      const message = error.response?.data?.error || 'Error al restaurar usuario';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleChangePassword = async () => {
    try {
      await backendClient.put(`/users/${editingUser.id}/change-password`, {
        newPassword,
      });
      setSnackbar({ open: true, message: 'Contraseña cambiada exitosamente', severity: 'success' });
      setPasswordDialog(false);
      setNewPassword('');
      setEditingUser(null);
    } catch (error) {
      console.error('Error changing password:', error);
      const message = error.response?.data?.error || 'Error al cambiar contraseña';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', width: 150, editable: false },
    { field: 'email', headerName: 'Email', width: 200, editable: false },
    {
      field: 'role',
      headerName: 'Rol',
      width: 100,
      valueFormatter: (params) => params.value || 'vacío',
      renderCell: (params) => (
        <Typography variant="body2" color={params.value === 'admin' ? 'primary' : 'textSecondary'}>
          {params.value || 'vacío'}
        </Typography>
      ),
    },
    {
      field: 'isConfirmed',
      headerName: 'Confirmado',
      width: 100,
      type: 'boolean',
      valueFormatter: (params) => params.value === null ? 'vacío' : params.value ? 'Sí' : 'No',
    },
    {
      field: 'createdAt',
      headerName: 'Creado',
      width: 150,
      valueFormatter: (params) => params.value ? dayjs(params.value).format('DD/MM/YYYY') : 'vacío',
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenDialog(params.row)} color="primary" size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => { setEditingUser(params.row); setPasswordDialog(true); }} color="secondary" size="small">
            <LockResetIcon />
          </IconButton>
          {params.row.deletedAt ? (
            <IconButton onClick={() => handleRestore(params.row.id)} color="success" size="small">
              <RestoreIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small" disabled={params.row.id === currentUserId}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <Button startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
        Agregar Usuario
      </Button>
      <GridToolbarExport />
    </GridToolbarContainer>
  );

  if (isMobile) {
    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Usuarios</Typography>
          <Button startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Agregar
          </Button>
        </Box>
        <List>
          {users && users.map((user) => (
            <Box key={user.id}>
              <ListItem divider>
                <ListItemText
                  primary={`${user.name || 'vacío'} (${user.email || 'vacío'})`}
                  secondary={`Rol: ${user.role || 'vacío'} | Confirmado: ${user.isConfirmed === null ? 'vacío' : user.isConfirmed ? 'Sí' : 'No'}`}
                />
              </ListItem>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1, px: 2, pb: 1 }}>
                <Button onClick={() => handleOpenDialog(user)} variant="outlined" size="small" color="primary">
                  Editar
                </Button>
                <Button onClick={() => { setEditingUser(user); setPasswordDialog(true); }} variant="outlined" size="small" color="secondary">
                  Contraseña
                </Button>
                {user.deletedAt ? (
                  <Button onClick={() => handleRestore(user.id)} variant="outlined" size="small" color="success">
                    Restaurar
                  </Button>
                ) : (
                  <Button onClick={() => handleDelete(user.id)} variant="outlined" size="small" color="error" disabled={user.id === currentUserId}>
                    Eliminar
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </List>

        {/* Dialog for Create/Edit User */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
            />
            {!editingUser && (
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
              />
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="basic">Básico</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isConfirmed}
                  onChange={(e) => setFormData({ ...formData, isConfirmed: e.target.checked })}
                />
              }
              label="Confirmado"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for Change Password */}
        <Dialog open={passwordDialog} onClose={() => { setPasswordDialog(false); setEditingUser(null); }} fullWidth maxWidth="sm">
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setPasswordDialog(false); setEditingUser(null); }}>Cancelar</Button>
            <Button onClick={handleChangePassword} variant="contained">
              Cambiar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 600, width: '100%', pb: 8 }}>
      <DataGrid
        rows={users || []}
        columns={columns}
        loading={loading}
        components={{
          Toolbar: CustomToolbar,
        }}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableSelectionOnClick
      />

      {/* Dialog for Create/Edit User */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          {!editingUser && (
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="basic">Básico</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Change Password */}
      <Dialog open={passwordDialog} onClose={() => { setPasswordDialog(false); setEditingUser(null); }} fullWidth maxWidth="sm">
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPasswordDialog(false); setEditingUser(null); }}>Cancelar</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Cambiar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersGrid;
