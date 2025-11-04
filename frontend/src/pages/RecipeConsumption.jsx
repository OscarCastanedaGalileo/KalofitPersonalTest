import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { getRecipes } from '../api/recipes';
import { getTags } from '../api';
import { createFoodLogsFromRecipe } from '../api/recipes';

export default function RecipeConsumption() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Estados para el formulario
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Cargar tags disponibles al montar el componente
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await getTags();
        setAvailableTags(tagsData.map(tag => tag.name));
      } catch (err) {
        console.error('Error loading tags:', err);
        // No mostrar error al usuario por tags, es opcional
      }
    };

    loadTags();
  }, []);
  const [calculatedCalories, setCalculatedCalories] = useState(0);

  // Cargar recetas y tags disponibles
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [recipesData, tagsData] = await Promise.all([
          getRecipes(),
          getTags()
        ]);
        console.log('Recetas cargadas:', recipesData);
        setRecipes(Array.isArray(recipesData) ? recipesData : []);
        setAvailableTags(tagsData.map(tag => tag.name));
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error cargando datos necesarios');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calcular calorías cuando cambia la receta o la cantidad
  useEffect(() => {
    if (selectedRecipe && quantity > 0) {
      let totalCalories = 0;
      selectedRecipe.ingredients?.forEach(ingredient => {
        const caloriesPerGram = ingredient.food?.caloriesPerGram || 0;
        const gramsInRecipe = ingredient.grams || 0;
        totalCalories += caloriesPerGram * gramsInRecipe;
      });
      setCalculatedCalories(totalCalories * quantity);
    } else {
      setCalculatedCalories(0);
    }
  }, [selectedRecipe, quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipe) {
      setError('Por favor selecciona una receta');
      return;
    }

    if (!quantity || Number(quantity) < 1) {
      setError('Por favor ingresa una cantidad válida (mínimo 1)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createFoodLogsFromRecipe(selectedRecipe.id, {
        quantity,
        notes,
        tags: tags,
        consumedAt: new Date()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/reports');
      }, 1500);
    } catch (err) {
      console.error('Error creating food logs:', err);
      setError('Error al registrar el consumo de la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/reports');
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
            ¡Consumo registrado exitosamente!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Redirigiendo...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        pb: 10 // Añadir padding extra en la parte inferior para el menú
      }}
    >
      <Box
        sx={{
          maxWidth: 600,
          width: '100%',
          mx: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            Registrar consumo de receta
          </Typography>
        </Box>

        {/* Formulario */}
        <Paper 
            sx={{ 
              p: 3,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              mb: 2 // Margen inferior para separar del menú
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form 
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
              }}
            >
              <Stack 
                spacing={3} 
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  mb: 2
                }}
              >
              {/* Selector de receta */}
              <Autocomplete
                options={recipes}
                getOptionLabel={(option) => option.name}
                onChange={(_, newValue) => setSelectedRecipe(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Receta"
                    required
                  />
                )}
              />

              {/* Mostrar ingredientes de la receta seleccionada */}
              {selectedRecipe && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Ingredientes:
                  </Typography>
                  <List dense>
                    {selectedRecipe.ingredients?.map((ingredient, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={ingredient.food?.name}
                          secondary={`${ingredient.grams}g - ${ingredient.food?.caloriesPerGram * ingredient.grams} cal`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="subtitle2">
                      Calorías por porción:
                    </Typography>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
                      {Math.round(selectedRecipe.totalCalories)} cal
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Cantidad */}
              <TextField
                label="Cantidad de porciones"
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir campo vacío o valores mayores a 0
                  if (value === '' || Number(value) > 0) {
                    setQuantity(value === '' ? '' : Number(value));
                  }
                }}
                required
                inputProps={{ min: 1, step: 1 }}
                helperText="Número de porciones consumidas"
                error={quantity === '' || Number(quantity) < 1}
              />

              {/* Calorías calculadas */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  textAlign: 'center',
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Total de calorías
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {calculatedCalories > 0 ? Math.round(calculatedCalories) : 0}
                </Typography>
                <Typography variant="body2">
                  calorías
                </Typography>
              </Paper>

              {/* Tags */}
              <Autocomplete
                multiple
                options={availableTags}
                value={tags}
                onChange={(_, newValue) => setTags(newValue)}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Etiquetas (opcional)"
                    placeholder="Selecciona o escribe nuevas etiquetas"
                    helperText="Etiquetas para categorizar tu consumo (ej: desayuno, saludable, favorito)"
                  />
                )}
                fullWidth
              />

              {/* Notas */}
              <TextField
                label="Notas"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              </Stack>
              {/* Botón submit */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !selectedRecipe}
                sx={{ 
                  mt: 'auto',
                  mb: 2 // Margen inferior adicional
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    Registrando...
                  </Box>
                ) : (
                  'Registrar consumo'
                )}
              </Button>
            </form>
        </Paper>
      </Box>
    </Box>
  );
}