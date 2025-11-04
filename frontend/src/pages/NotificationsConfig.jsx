import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import * as api from '../api'; // Importamos todas las funciones de nuestra api/index.js
import {
  Container,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Paper,
  Stack,
  Divider,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

export default function NotificationsConfig() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para cargar los recordatorios
  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getReminders();
      setReminders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Función para eliminar un recordatorio
  const handleDelete = async (id) => {
    try {
      await api.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete reminder: " + err.message);
    }
  };

  // Función para calcular el tiempo restante hasta la notificación
  const getTimeUntil = (time) => {
    if (!time) return '';
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    let diffMs = target - now;
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Si ya pasó, calcular para el día siguiente

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) return `Next in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMinutes > 0) return `Next in ${diffMinutes} min`;
    return 'Now';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        pb: 4,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="sm" sx={{ pt: 6 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          {/* Header con botón de cerrar */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Tooltip title="Close">
              <IconButton onClick={() => navigate('/reports')}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h5" fontWeight="bold">
              Config Notifications
            </Typography>
            <IconButton color="primary" onClick={() => navigate('/notifications/new')}>
              <AddIcon />
            </IconButton>
          </Box>

          {/* Lista de recordatorios */}
          {reminders.length === 0 ? (
            <Typography align="center" color="text.secondary">
              No reminders set.
            </Typography>
          ) : (
            <List>
              {reminders.map(reminder => (
                <React.Fragment key={reminder.id}>
                  <ListItem sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Texto principal */}
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="500">
                          {reminder.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {getTimeUntil(reminder.time)}
                        </Typography>
                      }
                    />

                    {/* Hora */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mx: 2, whiteSpace: 'nowrap' }}
                    >
                      {reminder.time.slice(0, 5)}
                    </Typography>

                    {/* Íconos alineados a la derecha */}
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/notifications/${reminder.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
