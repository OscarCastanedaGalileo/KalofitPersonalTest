import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Box, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Menu, MenuItem, Divider, TextField, InputAdornment, Grid } from "@mui/material";
import { useTheme, alpha } from '@mui/material/styles';
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { backendClient } from "../api/backendClient";

const BASE = import.meta.env.VITE_API_BASE_URL;

const FoodsList = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();

  // Fetching and state management functions
  const fetchFoods = async () => {
    try {
      const data = await backendClient.get("/foods");
      setFoods(data);
    } catch (error) {
      console.error("Error fetching foods", error);
    }
  };

  const fetchCategories = async () => {
    try {
      // const res = await fetch(`${BASE}/food-categories`);
      const data = await backendClient.get("/food-categories");
      const catMap = {};
      data.forEach((cat) => {
        catMap[cat.id] = cat.name;
      });
      setCategories(catMap);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Are you sure you want to delete this food item?")) return;
    try {
      await backendClient.delete(`/foods/${id}`);
      await fetchFoods();
      alert("Food item deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Server error.");
    }
  };

  const filteredFoods = foods.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const customFoodCount = foods.filter((food) => food.isCustom === true).length;

  const handleMenuClick = (event, food) => {
    setAnchorEl(event.currentTarget);
    setSelectedFood(food);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFood(null);
  };
  const handleEdit = () => {
    if (selectedFood) navigate(`/edit-food/${selectedFood.id}`);
    handleMenuClose();
  };
  const handleDeleteClick = () => {
    if (selectedFood) handleDelete(selectedFood.id);
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: 'background.default',
        minHeight: '100vh',
        color: 'text.primary',
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      {/* Navigation arrows */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <IconButton color="inherit" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Foods List
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(`/register-food`)}
          size="small"
          sx={(t) => ({
            backgroundColor: t.palette.primary.main,
            color: t.palette.text.primary,
            fontWeight: 'bold',
            '&:hover': { backgroundColor: alpha(t.palette.primary.main, 0.9) },
            py: 0.5,
          })}
        >
          ADD NEW FOOD
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate(`/recipes`)}
          size="small"
          sx={(t) => ({
            backgroundColor: '#2c6e49', // Un verde más oscuro y elegante
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: 2,
            border: '1px solid #52b788',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            '&:hover': { 
              backgroundColor: '#52b788',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            },
            py: 0.5,
            transition: 'all 0.3s ease'
          })}
        >
          MY RECIPES
        </Button>
      </Box>

      {/* TOTAL CUSTOM ITEMS, SEARCH BAR */}
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          py: 2,
          borderBottom: "1px solid #444", // LINES - CSS
          mb: 2,
        }}
      >
        <Grid item xs={12} sm={8}>
            <TextField
            fullWidth
            variant="outlined"
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              width: "100%",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default',
                  color: 'text.primary',
                  '& fieldset': { borderColor: theme.palette.outlineVariant.main },
                  '&:hover fieldset': { borderColor: theme.palette.outline.main },
                },
                // focused outline
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: `${theme.palette.primary.main} !important`,
                },
                '& .MuiInputBase-input::placeholder': { color: theme.palette.text.secondary, opacity: 1 },
            }}
            InputProps={{
              // SEARCH ICON COLOR - CSS
              startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid  sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {customFoodCount} {/* Usa el valor corregido */}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ADDED BY ME
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Foods list renderizes filteredFoods */}
      <List disablePadding>
        {filteredFoods.map((food) => (
          <div key={food.id}>
            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                    {food.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {`${categories[food.foodCategoryId] || 'Custom'} • ${food.caloriesPerGram} Cal/g`}
                  </Typography>
                }
              />

              <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="options" onClick={(e) => handleMenuClick(e, food)} sx={{ color: theme.palette.text.secondary }}>
                  <Typography variant="h6">...</Typography>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" sx={{ backgroundColor: theme.palette.outlineVariant.main }} />
          </div>
        ))}
      </List>

      {/* Menu and Bottom Button */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.surfacePrimary.main,
            color: theme.palette.text.primary,
          },
        }}
      >
        <MenuItem onClick={handleEdit}>Edit Food</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete Food</MenuItem>
      </Menu>

      <Box sx={{ bottom: 0, left: 0, right: 0, p: 2, maxWidth: 600, margin: "0 auto" }}>
        <Button variant="contained" fullWidth size="large" sx={(t) => ({ backgroundColor: t.palette.primary.main, color: t.palette.text.primary, '&:hover': { backgroundColor: alpha(t.palette.primary.main, 0.9) } })} onClick={() => navigate("/")}>
          Done
        </Button>
      </Box>
    </Box>
  );
};

export default FoodsList;
