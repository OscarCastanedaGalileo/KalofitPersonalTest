// src/components/CalorieCalculator.jsx
import React, { useState, useEffect } from 'react';
import {
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';

function CalorieCalculator() {
  const [alimentos, setAlimentos] = useState([]);
  const [selectedAlimento, setSelectedAlimento] = useState('');
  const [gramos, setGramos] = useState(100);
  const [totalCalorias, setTotalCalorias] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/alimentos')
      .then(res => res.json())
      .then(data => {
        setAlimentos(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar datos:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedAlimento && gramos > 0) {
      const alimentoActual = alimentos.find(a => a.id === selectedAlimento);
      const calorias = gramos * alimentoActual.calorias_por_gramo;
      setTotalCalorias(calorias);
    } else {
      setTotalCalorias(0);
    }
  }, [selectedAlimento, gramos, alimentos]);

  const handleAlimentoChange = (event) => setSelectedAlimento(event.target.value);
  const handleGramosChange = (event) => setGramos(event.target.value < 0 ? 0 : event.target.value);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#122B2A',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            backgroundColor: '#0E2221',
            borderRadius: 3,
            p: 4,
            boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.4)',
            width: '90%',
            maxWidth: 500,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: '#FFFFFF',
              textAlign: 'center',
              fontWeight: 'bold',
              mb: 3,
            }}
          >
            Calorie Calculator
          </Typography>

          {/* Selector de Alimento */}
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: '#ccc' }}>Food</InputLabel>
            <Select
              value={selectedAlimento}
              label="Alimento"
              onChange={handleAlimentoChange}
              sx={{
                color: '#fff',
                backgroundColor: selectedAlimento ? '#67E67C33' : '#2E2E2E',
                '& .MuiSelect-icon': { color: '#67E67C' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#67E67C',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#67E67C',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#555',
                },
              }}
            >
              {alimentos.map(alimento => (
                <MenuItem key={alimento.id} value={alimento.id}>
                  {alimento.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Campo de Gramos */}
          <TextField
            label="Grams"
            type="number"
            value={gramos}
            onChange={handleGramosChange}
            fullWidth
            margin="normal"
            disabled={!selectedAlimento}
            inputProps={{ min: 0, step: "1" }}
            sx={{
              input: { color: '#fff' },
              label: { color: '#ccc' },
              '& .MuiOutlinedInput-root': {
                backgroundColor: selectedAlimento ? '#67E67C33' : '#2E2E2E',
                '& fieldset': {
                  borderColor: '#555',
                },
                '&:hover fieldset': {
                  borderColor: '#67E67C',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#67E67C',
                },
              },
            }}
          />

          {/* Resultado */}
          <Typography
            variant="h5"
            component="p"
            sx={{
              mt: 3,
              textAlign: 'center',
              color: '#FFFFFF',
            }}
          >
            Total: <strong>{totalCalorias.toFixed(2)} kcal</strong>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}

export default CalorieCalculator;
