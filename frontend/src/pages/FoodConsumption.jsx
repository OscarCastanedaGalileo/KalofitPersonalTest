import { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router";
import { getFoodLogById, createFoodLog, updateFoodLog, getFoods, getFoodUnitsByFoodId, getTags } from "../api";
import dayjs from "dayjs";

const FoodConsumption = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Puede ser "new" o un ID numérico
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Datos de alimentos y unidades
  const [foods, setFoods] = useState([]);
  const [foodUnits, setFoodUnits] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);

  // Datos de tags
  const [availableTags, setAvailableTags] = useState([]);

  const isEditing = id && id !== 'new'; // Si id existe y no es "new", estamos editando

  // Cargar datos del registro si estamos editando
  useEffect(() => {
    if (isEditing) {
      const loadFoodLog = async () => {
        setInitialLoading(true);
        setError(null);
        try {
          const foodLog = await getFoodLogById(id);
          if (foodLog.foodId) {
            await loadFoodUnits(foodLog.foodId.toString());
          }
          setFormData({
            foodId: foodLog.foodId?.toString() || '',
            unitId: foodLog.unitId?.toString() || '',
            quantity: foodLog.quantity?.toString() || '1',
            grams: foodLog.grams?.toString() || '',
            calories: foodLog.totalCalories?.toString() || '',
            notes: foodLog.notes || '',
            tags: foodLog.tags?.map(tag => tag.name) || [],
          });

          // Cargar unidades disponibles para el alimento seleccionado
        } catch (err) {
          console.error('Error loading food log:', err);
          setError('Error al cargar el registro de comida');
        } finally {
          setInitialLoading(false);
        }
      };
      loadFoodLog();
    }
  }, [isEditing, id]);

  // Cargar alimentos al montar el componente
  useEffect(() => {
    const loadFoods = async () => {
      setLoadingFoods(true);
      try {
        const foodsData = await getFoods();
        setFoods(foodsData);
      } catch (err) {
        console.error('Error loading foods:', err);
        setError('Error al cargar los alimentos');
      } finally {
        setLoadingFoods(false);
      }
    };

    loadFoods();
  }, []);

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

  const [formData, setFormData] = useState({
    foodId: '',
    unitId: '',
    quantity: '1',
    grams: '',
    calories: '',
    notes: '',
    tags: [],
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si cambia el alimento, cargar sus unidades disponibles
    if (field === 'foodId' && value) {
      loadFoodUnits(value);
    }

    // Calcular calorías automáticamente cuando cambian los valores relevantes
    if (['foodId', 'unitId', 'quantity'].includes(field)) {
      setTimeout(() => calculateCalories(), 100); // Pequeño delay para que el estado se actualice
    }
  };

  // Cargar unidades disponibles para un alimento específico
  const loadFoodUnits = async (foodId) => {
    try {
      const unitsData = await getFoodUnitsByFoodId(foodId);
      setFoodUnits(unitsData);
      // Reset unit selection when food changes
      setFormData(prev => ({
        ...prev,
        unitId: '',
        grams: '',
        calories: ''
      }));
    } catch (err) {
      console.error('Error loading food units:', err);
      setFoodUnits([]);
    }
  };

  // Calcular calorías automáticamente
  const calculateCalories = () => {
    const { foodId, unitId, quantity } = formData;

    if (!foodId || !unitId || !quantity) {
      setFormData(prev => ({ ...prev, grams: '', calories: '' }));
      return;
    }

    const food = foods.find(f => f.id.toString() === foodId);
    const foodUnit = foodUnits.find(fu => fu.unitId.toString() === unitId);

    if (!food || !foodUnit || !food.caloriesPerGram) {
      setFormData(prev => ({ ...prev, grams: '', calories: '' }));
      return;
    }

    const qty = parseFloat(quantity) || 0;
    const grams = qty * foodUnit.gramsPerUnit;
    const calories = grams * food.caloriesPerGram;

    setFormData(prev => ({
      ...prev,
      grams: grams.toFixed(2),
      calories: calories.toFixed(0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.foodId || !formData.unitId || !formData.quantity) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = {
        foodId: parseInt(formData.foodId),
        unitId: parseInt(formData.unitId),
        grams: parseFloat(formData.grams),
        quantity: parseFloat(formData.quantity),
        totalCalories: parseFloat(formData.calories),
        consumedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        notes: formData.notes || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
      };

      if (isEditing) {
        await updateFoodLog(id, data);
      } else {
        await createFoodLog(data);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/reports');
      }, 1500);

    } catch (err) {
      console.error('Error saving food consumption:', err);
      setError(isEditing ? 'Error al actualizar el consumo de alimentos' : 'Error al guardar el consumo de alimentos');
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
            {isEditing ? 'Food consumption updated' : 'Food consumption logged'} successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Redirecting to reports...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2, pb: 10 }}>
      <Box
        sx={{
          mx: "auto",
          maxWidth: 600,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            {isEditing ? 'Edit Food Consumption' : 'Add Food Consumption'}
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ p: 3, bgcolor: 'background.default' }}>
          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Loading data...
              </Typography>
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* Selector de alimento */}
                  <FormControl fullWidth required>
                    <InputLabel>Food</InputLabel>
                    <Select
                      value={formData.foodId}
                      onChange={(e) => handleInputChange('foodId', e.target.value)}
                      disabled={loadingFoods}
                    >
                      {foods.map((food) => (
                        <MenuItem key={food.id} value={food.id.toString()}>
                          {food.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Select the food you want to log
                    </FormHelperText>
                  </FormControl>

                  {/* Selector de unidad de medida */}
                  <FormControl fullWidth required disabled={!formData.foodId}>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={formData.unitId}
                      onChange={(e) => handleInputChange('unitId', e.target.value)}
                    >
                      {foodUnits.map((foodUnit) => (
                        <MenuItem key={foodUnit.id} value={foodUnit.unitId.toString()}>
                          {foodUnit.unit.name} ({foodUnit.gramsPerUnit}g per unit)
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Select how you will measure this food
                    </FormHelperText>
                  </FormControl>

                  {/* Cantidad */}
                  <TextField
                    label="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    required
                    fullWidth
                    inputProps={{ min: 0.1, step: 0.1 }}
                    helperText="How many units will you consume"
                  />

                  {/* Gramos (calculado automáticamente) */}
                  <TextField
                    label="Total Grams"
                    type="number"
                    value={formData.grams}
                    disabled
                    fullWidth
                    helperText="Automatically calculated based on quantity and selected unit"
                  />

                  {/* Calorías (calculado automáticamente) */}
                  <TextField
                    label="Total Calories"
                    type="number"
                    value={formData.calories}
                    disabled
                    fullWidth
                    helperText="Automatically calculated based on grams and calories per gram of the food"
                  />

                  {/* Tags */}
                  <Autocomplete
                    multiple
                    options={availableTags}
                    value={formData.tags}
                    onChange={(event, newValue) => {
                      handleInputChange('tags', newValue);
                    }}
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
                    label="Notes (optional)"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    fullWidth
                    placeholder="Ex: Breakfast, lunch, snack..."
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || initialLoading || loadingFoods}
                    sx={{ mt: 2 }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        {isEditing ? 'Updating...' : 'Saving...'}
                      </Box>
                    ) : (
                      isEditing ? 'Update Consumption' : 'Log Consumption'
                    )}
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FoodConsumption;
