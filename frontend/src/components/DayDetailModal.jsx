import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Fab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Fastfood as FoodIcon,
  Scale as ScaleIcon,
  Whatshot as CaloriesIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { getFoodLogsByDate, deleteFoodLog } from '../api';

export default function DayDetailModal({ open, onClose, selectedDate, onDataChange }) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDayEntries = useCallback(async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);
    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const data = await getFoodLogsByDate(dateStr);
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Error loading day entries:', err);
      setError('Error al cargar los registros del día');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (open && selectedDate) {
      loadDayEntries();
    }
  }, [open, selectedDate, loadDayEntries]);

  const handleEdit = (entry) => {
    // Navegar a la página de edición con el ID del registro
    navigate(`/food-consumption/${entry.id}`);
    onClose(); // Cerrar el modal
  };

  const handleDelete = async (entryId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;

    try {
      await deleteFoodLog(entryId);
      await loadDayEntries();
      onDataChange && onDataChange(); // Notificar cambio para actualizar gráfico
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Error al eliminar el registro');
    }
  };

  const totalCalories = entries.reduce((sum, entry) => sum + (entry.totalCalories || 0), 0);
  console.log ({
    selectedDate,
    entries,
    totalCalories
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {selectedDate ? dayjs(selectedDate).format('dddd, MMMM D, YYYY') : 'Detalles del día'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registro diario de consumo de alimentos
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {Number(totalCalories ?? 0).toFixed(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              calorías totales
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Cargando registros...
            </Typography>
          </Box>
        ) : (
          <>
            {entries.length === 0 ? (
              <Box textAlign="center" py={8}>
                <FoodIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No hay registros para este día
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ¡Agrega tu primer consumo de alimentos!
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {entries.map((entry) => (
                  <Grid item xs={12} sm={6} md={4} key={entry.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: (theme) => theme.shadows[8],
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1, mr: 1 }}>
                            {entry.food?.name || 'Alimento desconocido'}
                          </Typography>
                          <Box display="flex" gap={0.5}>
                            <IconButton
                              onClick={() => handleEdit(entry)}
                              size="small"
                              color="primary"
                              sx={{ p: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(entry.id)}
                              size="small"
                              color="error"
                              sx={{ p: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <ScaleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                          <Typography variant="body2" color="text.secondary">
                            {entry.grams} gramos
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={2}>
                          <CaloriesIcon sx={{ mr: 1, color: 'primary.main', fontSize: 18 }} />
                          <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            {Number(entry.totalCalories ?? 0).toFixed(0)} calorías
                          </Typography>
                        </Box>

                        {entry.unit && (
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              Unidad: {entry.unit.name}
                            </Typography>
                          </Box>
                        )}

                        {entry.notes && (
                          <Box mb={2}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              "{entry.notes}"
                            </Typography>
                          </Box>
                        )}

                        {entry.tags?.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Etiquetas:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {entry.tags.map((tag, index) => (
                                <Chip
                                  key={index}
                                  label={tag.name}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          variant="outlined"
        >
          Cerrar
        </Button>

        <Fab
          color="primary"
          onClick={() => {
            navigate('/food-consumption/new');
            onClose();
          }}
          sx={{ boxShadow: 3 }}
        >
          <AddIcon />
        </Fab>
      </DialogActions>
    </Dialog>
  );
}
