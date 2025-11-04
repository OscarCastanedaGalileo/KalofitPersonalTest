import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  TextField,
  InputAdornment,
  Grid,
  Chip,
} from "@mui/material";
import { useTheme, alpha } from '@mui/material/styles';
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getRecipes, deleteRecipe } from "../api/recipes";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();

  // Fetching recipes
  const fetchRecipes = async () => {
    try {
      const data = await getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes", error);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Are you sure you want to delete this recipe?")) return;
    try {
      await deleteRecipe(id);
      await fetchRecipes();
      alert("Recipe deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Server error.");
    }
  };

  const filteredRecipes = recipes.filter((recipe) => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMenuClick = (event, recipe) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecipe(recipe);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecipe(null);
  };

  const handleEdit = () => {
    if (selectedRecipe) navigate(`/recipes/edit/${selectedRecipe.id}`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedRecipe) handleDelete(selectedRecipe.id);
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
      {/* Header with back button and title */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <IconButton color="inherit" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Recipes List
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(`/recipes/new`)}
          size="small"
          sx={(t) => ({
            backgroundColor: t.palette.primary.main,
            color: t.palette.text.primary,
            fontWeight: 'bold',
            '&:hover': { backgroundColor: alpha(t.palette.primary.main, 0.9) },
            py: 0.5,
          })}
        >
          ADD NEW RECIPE
        </Button>
      </Box>

      {/* Search bar */}
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          py: 2,
          borderBottom: "1px solid #444",
          mb: 2,
        }}
      >
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search recipes..."
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
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: `${theme.palette.primary.main} !important`,
              },
              '& .MuiInputBase-input::placeholder': { color: theme.palette.text.secondary, opacity: 1 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {recipes.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              MY RECIPES
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Recipes list */}
      <List disablePadding>
        {filteredRecipes.map((recipe) => (
          <div key={recipe.id}>
            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                    {recipe.name}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      {`${recipe.totalCalories} Cal • ${recipe.servings} servings`}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {recipe.ingredients?.map((ingredient, index) => (
                        <Chip
                          key={index}
                          label={ingredient.food?.name}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="options" 
                  onClick={(e) => handleMenuClick(e, recipe)}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <Typography variant="h6">...</Typography>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" sx={{ backgroundColor: theme.palette.outlineVariant.main }} />
          </div>
        ))}
      </List>

      {/* Options menu */}
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
        <MenuItem onClick={handleEdit}>Edit Recipe</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete Recipe</MenuItem>
      </Menu>

      {/* Done button */}
      <Box sx={{ bottom: 0, left: 0, right: 0, p: 2, maxWidth: 600, margin: "0 auto" }}>
        <Button 
          variant="contained" 
          fullWidth 
          size="large" 
          sx={(t) => ({ 
            backgroundColor: t.palette.primary.main, 
            color: t.palette.text.primary, 
            '&:hover': { backgroundColor: alpha(t.palette.primary.main, 0.9) } 
          })} 
          onClick={() => navigate("/")}
        >
          Done
        </Button>
      </Box>
    </Box>
  );
};

export default RecipeList;