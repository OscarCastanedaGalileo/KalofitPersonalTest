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
    grams: '0',
    calories: '0',
    notes: '',
    tags: [],
  });

  // Monitorear cambios en los valores relevantes para el cálculo
  useEffect(() => {
    if (formData.foodId && formData.unitId && formData.quantity) {
      calculateCalories();
    }
  }, [formData.foodId, formData.unitId, formData.quantity]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si cambia el alimento, cargar sus unidades disponibles
    if (field === 'foodId' && value) {
      loadFoodUnits(value);
    }
  };

  // Cargar unidades disponibles para un alimento específico
  const loadFoodUnits = async (foodId) => {
    try {
      console.log('Cargando unidades para alimento:', foodId);
      const unitsData = await getFoodUnitsByFoodId(foodId);
      console.log('Unidades recibidas:', unitsData);
      
      if (!Array.isArray(unitsData) || unitsData.length === 0) {
        console.warn('No se encontraron unidades para el alimento');
        setError('No hay unidades definidas para este alimento');
        setFoodUnits([]);
        return;
      }

      // Verificar la estructura de los datos
      const validUnits = unitsData.every(unit => 
        unit && typeof unit === 'object' && 
        'unitId' in unit && 
        'gramsPerUnit' in unit
      );

      if (!validUnits) {
        console.error('Estructura de unidades inválida:', unitsData);
        setError('Error en la estructura de unidades');
        return;
      }

      setFoodUnits(unitsData);
      setError(null);

      // Reset unit selection when food changes
      setFormData(prev => ({
        ...prev,
        unitId: '',
        grams: '0',
        calories: '0'
      }));
    } catch (err) {
      console.error('Error loading food units:', err);
      setError('Error al cargar las unidades del alimento');
      setFoodUnits([]);
    }
  };

  // Calcular calorías automáticamente
  const calculateCalories = () => {
    const { foodId, unitId, quantity } = formData;
    
    console.log('Calculando calorías con:', { foodId, unitId, quantity });

    // Validar que tenemos todos los valores necesarios
    if (!foodId || !unitId || !quantity) {
      console.log('Faltan campos requeridos');
      setFormData(prev => ({ ...prev, grams: '0', calories: '0' }));
      return;
    }

    // Convertir a números y validar
    const foodIdNum = parseInt(foodId);
    const unitIdNum = parseInt(unitId);
    const quantityNum = parseFloat(quantity);

    if (isNaN(foodIdNum) || isNaN(unitIdNum) || isNaN(quantityNum)) {
      console.error('Error en conversión de números:', { foodId, unitId, quantity });
      setFormData(prev => ({ ...prev, grams: '0', calories: '0' }));
      return;
    }

    // Buscar el alimento
    const food = foods.find(f => f.id === foodIdNum);
    if (!food) {
      console.error('No se encontró el alimento:', foodIdNum);
      setFormData(prev => ({ ...prev, grams: '0', calories: '0' }));
      setError('No se encontró el alimento');
      return;
    }

    // Buscar la unidad y sus datos de conversión
    const foodUnit = foodUnits.find(fu => Number(fu.unitId) === unitIdNum);
    if (!foodUnit || !foodUnit.gramsPerUnit) {
      console.error('No se encontró la unidad o sus datos de conversión:', {
        unitId: unitIdNum,
        foodUnits: foodUnits
      });
      setFormData(prev => ({ ...prev, grams: '0', calories: '0' }));
      setError('No se encontró la información de la unidad');
      return;
    }

    try {
      // Obtener los valores necesarios para el cálculo
      const gramsPerUnit = Number(foodUnit.gramsPerUnit);
      const caloriesPerGram = Number(food.caloriesPerGram);

      console.log('Datos para cálculo:', {
        quantityNum,
        gramsPerUnit,
        caloriesPerGram,
        food,
        foodUnit
      });

      // Calcular gramos totales
      const totalGrams = quantityNum * gramsPerUnit;
      if (isNaN(totalGrams) || totalGrams <= 0) {
        throw new Error('Error al calcular los gramos totales');
      }

      // Calcular calorías totales
      const totalCalories = totalGrams * caloriesPerGram;
      if (isNaN(totalCalories) || totalCalories <= 0) {
        throw new Error('Error al calcular las calorías totales');
      }

      console.log('Resultados:', {
        totalGrams,
        totalCalories
      });

      // Actualizar el formulario con los resultados
      setFormData(prev => ({
        ...prev,
        grams: totalGrams.toFixed(1),
        calories: totalCalories.toFixed(0)
      }));

      // Limpiar error si existe
      setError(null);

    } catch (error) {
      console.error('Error en cálculos:', error);
      setFormData(prev => ({
        ...prev,
        grams: '0',
        calories: '0'
      }));
      setError('Error en los cálculos: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa de los campos requeridos
    if (!formData.foodId || !formData.unitId || !formData.quantity) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar que los cálculos se hayan realizado
    if (!formData.grams || !formData.calories || 
        formData.grams === '0' || formData.calories === '0') {
      setError('Error en el cálculo de calorías. Por favor verifica los valores');
      return;
    }

    // Validar que los valores sean números válidos
    const quantity = parseFloat(formData.quantity);
    const grams = parseFloat(formData.grams);
    const calories = parseFloat(formData.calories);

    if (isNaN(quantity) || quantity <= 0 ||
        isNaN(grams) || grams <= 0 ||
        isNaN(calories) || calories <= 0) {
      setError('Los valores ingresados no son válidos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = {
        foodId: parseInt(formData.foodId),
        unitId: parseInt(formData.unitId),
        grams: grams,
        quantity: quantity,
        totalCalories: calories,
        consumedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        notes: formData.notes || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
      };

      console.log('Enviando datos:', data);

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

                  {/* Resumen de cálculos */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      borderRadius: 2
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Total de gramos */}
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Total Grams
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
                          {formData.grams ? `${Number(formData.grams).toFixed(1)}g` : '0g'}
                        </Typography>
                      </Box>

                      {/* Separador */}
                      <Box sx={{ width: '100%', height: '1px', bgcolor: 'primary.main', opacity: 0.2 }} />

                      {/* Total de calorías */}
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Total Calories
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                          {formData.calories ? Math.round(Number(formData.calories)) : '0'}
                        </Typography>
                        <Typography variant="body2">
                          calories
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

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
