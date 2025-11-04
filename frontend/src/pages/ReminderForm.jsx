import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import * as api from '../api'; // Importamos la API
import {
  Container,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function ReminderForm() {
  const { id } = useParams(); // Obtiene el :id de la URL
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Estado del formulario
  const [name, setName] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  // Estado de la lógica
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Si estamos en modo edición, cargar los datos del recordatorio
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .getReminderById(id)
        .then((data) => {
          setName(data.name);
          const [h, m] = data.time.substring(0, 5).split(':');
          setHour(h);
          setMinute(m);
          setIsEnabled(data.isEnabled);
        })
        .catch((err) => setError(err.message || 'Failed to load reminder data'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  // Lógica de validación
  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!hour || !minute) {
      setError('Hour and minute are required');
      return false;
    }
    return true;
  };

  // Lógica de guardado
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    const payload = { name, time, isEnabled };

    try {
      if (isEditMode) {
        // Lógica de Actualización
        await api.updateReminder(id, payload);
      } else {
        // Lógica de Creación
        await api.createReminder(payload);
      }
      navigate('/notifications/config'); // Regresar a la lista al guardar
    } catch (err) {
      setError(err.message || 'Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        pb: 8, // se ajustó un poco el padding inferior
      }}
    >
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, position: 'relative' }}>
          {/* X para volver a Reports */}
          <IconButton
            onClick={() => navigate('/reports')}
            sx={{ position: 'absolute', top: 12, left: 12 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h5" fontWeight="bold" align="center" mb={3}>
            {isEditMode ? 'Edit Notification' : 'Add Notification'}
          </Typography>

          {/* Aquí iría el componente de formulario */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Breakfast, lunch, snack..."
              disabled={loading}
              margin="normal"
            />

            {/* Inputs para Hora y Minuto */}
            <Box textAlign="center" mt={3} mb={2}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Hours
              </Typography>

              <Box display="flex" justifyContent="center" gap={2}>
                <TextField
                  type="number"
                  label="Hour"
                  value={hour}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (Number(value) >= 0 && Number(value) < 24)) {
                      setHour(value);
                    }
                  }}
                  inputProps={{ min: 0, max: 23 }}
                  sx={{ width: 100 }}
                />

                <TextField
                  type="number"
                  label="Minute"
                  value={minute}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (Number(value) >= 0 && Number(value) < 60)) {
                      setMinute(value);
                    }
                  }}
                  inputProps={{ min: 0, max: 59 }}
                  sx={{ width: 100 }}
                />
              </Box>
            </Box>

            {/* Lógica para habilitar/deshabilitar
            {isEditMode && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Enabled"
              />
            )}

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                Error: {error}
              </Typography>
            )}
                */}
          </form>
        </Paper>
      </Container>

      {/* Botones fuera del contenedor principal */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 60, // 👈 subidos un poco (antes estaba 20)
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate('/notifications/config')}
          disabled={loading}
          sx={{ width: '90%', maxWidth: 400 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ width: '90%', maxWidth: 400 }}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
}
