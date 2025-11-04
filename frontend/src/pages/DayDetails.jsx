import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Fab,
  Divider,
  Paper,
} from '@mui/material';
import ConsumptionTypeModal from '../components/ConsumptionTypeModal';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Fastfood as FoodIcon,
  Scale as ScaleIcon,
  Whatshot as CaloriesIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import dayjs from 'dayjs';
import { getDetailedFoodLogsByDate, deleteFoodLog } from '../api';

export default function DayDetails() {
  const navigate = useNavigate();
  const { date } = useParams(); // Obtener la fecha de la URL
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);

  const selectedDate = useMemo(() => date ? dayjs(date) : dayjs(), [date]);

  const loadDayEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const data = await getDetailedFoodLogsByDate(dateStr);
      console.log({data});
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Error loading day entries:', err);
      setError('Error al cargar los registros del día');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadDayEntries();
  }, [loadDayEntries]);

  const handleEdit = (entry) => {
    navigate(`/food-consumption/${entry.id}`);
  };

  const handleDelete = async (entryId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;

    try {
      await deleteFoodLog(entryId);
      await loadDayEntries();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Error al eliminar el registro');
    }
  };

  const handleBack = () => {
    navigate('/reports');
  };

  const handleConsumptionModalOpen = () => {
    setIsConsumptionModalOpen(true);
  };

  const handleConsumptionModalClose = () => {
    setIsConsumptionModalOpen(false);
  };

  const handleFoodConsumption = () => {
    setIsConsumptionModalOpen(false);
    navigate('/food-consumption/new');
  };

  const handleRecipeConsumption = () => {
    setIsConsumptionModalOpen(false);
    navigate('/recipe-consumption/new');
  };

  const totalCalories = entries.reduce((sum, entry) => sum + (Number(entry?.totalCalories || 0)), 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2, pb: 10 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          {/* Fila superior: Botón back + Fecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {selectedDate.format('dddd, MMMM D, YYYY')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Daily food consumption log
              </Typography>
            </Box>
          </Box>

          {/* Fila inferior: Total de calorías (ancho completo) */}
          <Paper sx={{ p: 3, textAlign: 'center', width: '100%' }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {Number(totalCalories ?? 0).toFixed(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              total calories
            </Typography>
          </Paper>
        </Box>

        {/* Content */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading entries...
            </Typography>
          </Box>
        ) : (
          <>
            {entries.length === 0 ? (
              <Box textAlign="center" py={8}>
                <FoodIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                  No entries for this day
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Add your first food consumption!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleConsumptionModalOpen}
                >
                  Add consumption
                </Button>
                <ConsumptionTypeModal
                  open={isConsumptionModalOpen}
                  onClose={handleConsumptionModalClose}
                  onFoodSelect={handleFoodConsumption}
                  onRecipeSelect={handleRecipeConsumption}
                />
              </Box>
            ) : (
              <List>
                {entries.map((entry) => (
                  <ListItem
                    key={entry.id}
                    divider
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 'bold',
                                flexGrow: 1,
                                mr: 1,
                                cursor: 'pointer',
                                '&:hover': { color: 'primary.main' }
                              }}
                              onClick={() => handleEdit(entry)}
                            >
                              {entry.food?.name || 'Unknown food'}
                            </Typography>
                            <IconButton
                              onClick={() => handleDelete(entry.id)}
                              size="small"
                              color="error"
                              sx={{ p: 0.5 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          <Box display="flex" alignItems="center" gap={3} mb={1}>
                            <Box display="flex" alignItems="center">
                              <ScaleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                              <Typography variant="body2" color="text.secondary">
                                {entry.grams}g
                              </Typography>
                            </Box>

                            <Box display="flex" alignItems="center">
                              <CaloriesIcon sx={{ mr: 1, color: 'primary.main', fontSize: 18 }} />
                              <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                {Number(entry.totalCalories ?? 0).toFixed(0)} cal
                              </Typography>
                            </Box>
                          </Box>

                          {/* Chips de unidad y categoría en línea horizontal separada */}
                          <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                            {entry.unit && (
                              <Chip
                                label={`Unit: ${entry.unit.name}`}
                                size="small"
                                variant="outlined"
                              />
                            )}

                            {entry.food?.category && (
                              <Chip
                                label={`Category: ${entry.food.category.name}`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                              />
                            )}
                          </Box>

                          {entry.notes && (
                            <Box mb={1}>
                              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                "{entry.notes}"
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                      secondary={
                        entry.tags?.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Labels:
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
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {/* Floating Action Button */}
        {entries.length > 0 && (
          <Fab
            color="primary"
            onClick={handleConsumptionModalOpen}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              boxShadow: 3,
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
    </Box>
  );
}
