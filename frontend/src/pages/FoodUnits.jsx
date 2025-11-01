import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { backendClient } from '../api/backendClient';
// import { useNavigate } from 'react-router-dom'; // Not used

// Mobile-first styles
const containerSx = (theme) => ({
  p: { xs: 2, md: 3 },
  bgcolor: theme.palette.background.default,
  minHeight: '100vh',
});

export default function FoodUnits() {
  const theme = useTheme();
  // const navigate = useNavigate(); // Not used, remove to fix lint
  const [foodUnits, setFoodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ foodId: '', unitId: '', gramsPerUnit: '' });
  const [foods, setFoods] = useState([]);
  const [units, setUnits] = useState([]);

  // Fetch all food units
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await backendClient.get('/api/foodunits');
        setFoodUnits(res);
        setLoading(false);
      } catch {
        setError('Error loading food units');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch foods and units for select options
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await backendClient.get('/foods/all');
        setFoods(res);
      } catch {
        // ignore error
      }
    };
    const fetchUnits = async () => {
      try {
        const res = await backendClient.get('/api/foodunits/units');
        setUnits(res);
      } catch {
        // ignore error
      }
    };
    fetchFoods();
    fetchUnits();
  }, []);

  // Open dialog for create/edit
  const handleOpen = (fu = null) => {
    if (fu) {
      setEditId(fu.id);
      setForm({ foodId: fu.food.id, unitId: fu.unit.id, gramsPerUnit: fu.gramsPerUnit });
    } else {
      setEditId(null);
      setForm({ foodId: '', unitId: '', gramsPerUnit: '' });
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm({ foodId: '', unitId: '', gramsPerUnit: '' });
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update food unit
  const handleSubmit = async () => {
    try {
      if (editId) {
        await backendClient.put(`/api/foodunits/${editId}`, form);
      } else {
        await backendClient.post('/api/foodunits', form);
      }
      // Refresh list
      const res = await backendClient.get('/api/foodunits');
      setFoodUnits(res);
      handleClose();
    } catch (e){
      console.log({e});
      setError('Error saving food unit');
    }
  };

  // Delete food unit
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food unit?')) return;
    try {
      await backendClient.delete(`/api/foodunits/${id}`);
      setFoodUnits(foodUnits.filter(fu => fu.id !== id));
    } catch {
      setError('Error deleting food unit');
    }
  };

  return (
    <Box sx={containerSx(theme)}>
      <Typography variant="h5" sx={{ color: theme.palette.primary.main, mb: 2, fontWeight: 'bold' }}>
        Food Units
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleOpen()}
        sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.onPrimary.main, mb: 2, borderRadius: 2, boxShadow: 1 }}
      >
        Add Unit
      </Button>
      {loading ? (
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box>
          {foodUnits.map(fu => (
            <Paper key={fu.id} sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: theme.palette.surfacePrimary.main, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: theme.palette.onSurfacePrimary.main }}>
                  {fu.food.name} ({fu.food.category?.name || 'No category'}) - {fu.unit.name} ({fu.unit.type})
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.onSurfaceVariant.main }}>
                  {fu.gramsPerUnit} grams per unit
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.outline.main }}>
                  Created by: {fu.creator?.name || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleOpen(fu)} sx={{ color: theme.palette.primary.main }}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(fu.id)} sx={{ color: theme.palette.danger.main }}><Delete /></IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.onPrimary.main }}>
          {editId ? 'Edit Food Unit' : 'Add Food Unit'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: theme.palette.background.paper }}>
          <TextField
            select
            label="Food"
            name="foodId"
            value={form.foodId}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ bgcolor: theme.palette.surfacePrimary.main }}
          >
            {foods.map(f => (
              <MenuItem key={f.id} value={f.id}>{f.name} ({f.category?.name || 'No category'})</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Unit"
            name="unitId"
            value={form.unitId}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ bgcolor: theme.palette.surfacePrimary.main }}
          >
            {units.map(u => (
              <MenuItem key={u.id} value={u.id}>{u.name} ({u.type})</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Grams per unit"
            name="gramsPerUnit"
            value={form.gramsPerUnit}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
            sx={{ bgcolor: theme.palette.surfacePrimary.main }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: theme.palette.background.paper }}>
          <Button onClick={handleClose} sx={{ color: theme.palette.outline.main }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.onPrimary.main }}>
            {editId ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
