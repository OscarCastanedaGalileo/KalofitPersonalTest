import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, RestaurantRounded } from '@mui/icons-material';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import { backendClient } from '../api/backendClient';
import { useTheme } from '@mui/material/styles';

export default function FoodUnits() {
  const theme = useTheme();
  const navigate = useNavigate();
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
    } catch (e) {
      console.log({ e });
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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 2 }}>
      <Box
        sx={{
          mx: "auto",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box sx={{ px: 2, pb: 9 }}>
          {/* Header section */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <IconButton color="inherit" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Food Units
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleOpen()}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  bgcolor: theme.palette.primary.main + '1A', // 10% opacity
                }
              }}
            >
              <Add />
            </IconButton>
          </Box>

          {/* Food Units Card */}
          <Card sx={{
            mt: 2.5,
            // bgcolor: "background.default",
            borderRadius: 4
            }}>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress sx={{ color: "primary.main" }} />
                </Box>
              ) : error ? (
                <Typography variant="body2" sx={{ color: "error.main", textAlign: "center", py: 2 }}>
                  {error}
                </Typography>
              ) : foodUnits.length === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                  No food units configured yet
                </Typography>
              ) : (
                <List sx={{ py: 0, px: 0 }}>
                  {foodUnits.map((fu) => (
                    <ListItem
                      key={fu.id}
                      sx={{
                        px: { xs: 1.5, sm: 2 },
                        py: { xs: 1.5, sm: 2 },
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: "background.default",
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                      }}
                    >
                      <Box sx={{ width: '100%', mb: { xs: 1, sm: 0 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mr: 1, flex: 1 }}>
                            {fu.food?.name || 'Unknown food'}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpen(fu)}
                              sx={{ color: "primary.main" }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(fu.id)}
                              sx={{ color: "danger.main" }}
                            >
                              <Delete />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                          {fu.unit?.name || 'Unknown unit'} ({fu.unit?.type || 'N/A'})
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>
                            {fu.gramsPerUnit}g per unit
                          </Typography>
                          {fu.food?.category && (
                            <Chip
                              label={fu.food.category.name}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                '& .MuiChip-label': { px: 0.5 }
                              }}
                            />
                          )}
                        </Stack>

                        {fu.creator?.name && (
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Created by: {fu.creator.name}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Dialog for Add/Edit */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: "background.default", color: "text.primary" }}>
          {editId ? 'Edit Food Unit' : 'Add Food Unit'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "background.default" }}>
          <TextField
            select
            label="Food"
            name="foodId"
            value={form.foodId}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ bgcolor: "surfacePrimary.main", borderRadius: 1 }}
          >
            {foods.map(f => (
              <MenuItem key={f.id} value={f.id}>
                {f.name} {f.category?.name && `(${f.category.name})`}
              </MenuItem>
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
            sx={{ bgcolor: "surfacePrimary.main", borderRadius: 1 }}
          >
            {units.map(u => (
              <MenuItem key={u.id} value={u.id}>
                {u.name} ({u.type})
              </MenuItem>
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
            sx={{ bgcolor: "surfacePrimary.main", borderRadius: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: "background.default" }}>
          <Button onClick={handleClose} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              color: "onPrimary.main",
              "&:hover": { bgcolor: "primary.main", opacity: 0.8 }
            }}
          >
            {editId ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
