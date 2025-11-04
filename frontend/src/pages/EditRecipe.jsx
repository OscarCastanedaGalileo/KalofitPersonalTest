import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router";
import { getRecipeById, updateRecipe } from "../api/recipes";
import { getFoods } from "../api";
import IngredientRow from "../components/IngredientRow";

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipeDetails, setRecipeDetails] = useState({
    name: "",
    servings: 1,
  });
  const [ingredients, setIngredients] = useState([]);
  const [allFoodOptions, setAllFoodOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de la receta y opciones de alimentos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar alimentos disponibles
        const foodsData = await getFoods();
        setAllFoodOptions(foodsData);
        
        // Cargar datos de la receta
        const recipeData = await getRecipeById(id);
        setRecipeDetails({
          name: recipeData.name,
          servings: recipeData.servings || 1,
        });

        // Convertir ingredientes existentes al formato necesario
        const existingIngredients = recipeData.ingredients.map(ing => ({
          tempId: Date.now() + Math.random(),
          foodId: ing.foodId,
          quantity: ing.quantity,
          unitId: ing.unitId,
          grams: ing.grams
        }));
        setIngredients(existingIngredients);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Error loading recipe data. Please try again.");
      } finally {
        setLoadingFoods(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setRecipeDetails({
      ...recipeDetails,
      [e.target.name]: e.target.value,
    });
  };

  const addIngredient = () => {
    if (loadingFoods) return;
    setIngredients([
      ...ingredients,
      {
        tempId: Date.now(),
        foodId: null,
        quantity: "",
        unitId: "",
      },
    ]);
  };

  const updateIngredient = (tempId, field, value) => {
    setIngredients(ingredients.map((ing) => 
      ing.tempId === tempId ? { ...ing, [field]: value } : ing
    ));
  };

  const removeIngredient = (tempId) => {
    setIngredients(ingredients.filter((ing) => ing.tempId !== tempId));
  };

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validIngredients = ingredients
      .filter((ing) => ing.foodId && ing.quantity && ing.unitId)
      .map(({ tempId, ...rest }) => ({
        ...rest,
        quantity: parseFloat(rest.quantity),
      }));

    if (validIngredients.length === 0) {
      alert("Please add at least one complete ingredient.");
      setLoading(false);
      return;
    }

    if (!recipeDetails.name.trim()) {
      alert("Please enter a name for the recipe.");
      setLoading(false);
      return;
    }

    const payload = {
      name: recipeDetails.name,
      servings: parseInt(recipeDetails.servings) || 1,
      ingredients: validIngredients,
    };

    try {
      await updateRecipe(id, payload);
      alert("Recipe Updated Successfully!");
      navigate("/recipes");
    } catch (err) {
      const errMsg = err.response?.data?.error || "Error updating recipe. Please try again.";
      setError(errMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#122B2A",
      color: "white",
      "& fieldset": { borderColor: "#555" },
      "&:hover fieldset": { borderColor: "#777" },
    },
    "& .MuiInputLabel-root": {
      color: "#aaa !important",
    },
    "& .Mui-focused .MuiInputLabel-root": {
      color: "#67E67C",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#67E67C !important",
    },
    "& .MuiSvgIcon-root": {
      color: "#aaa",
    },
  };

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "#122B2A",
        minHeight: "100vh",
        color: "white",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, py: 1 }}>
        <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Edit Recipe
        </Typography>
        <Box sx={{ width: 48 }} />
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleUpdateRecipe}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: "100%",
          mx: "auto",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2, color: "#67E67C" }}>
          Recipe Details
        </Typography>

        <TextField 
          label="Recipe Name" 
          name="name" 
          fullWidth 
          value={recipeDetails.name} 
          onChange={handleChange} 
          required 
          sx={inputStyles} 
        />

        <TextField 
          label="Servings (Portions)" 
          name="servings" 
          type="number" 
          fullWidth 
          value={recipeDetails.servings} 
          onChange={handleChange} 
          required 
          inputProps={{ min: 1 }} 
          sx={inputStyles} 
        />

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, color: "#67E67C" }}>
          Ingredients
          {loadingFoods && (
            <Typography component="span" variant="body2" sx={{ ml: 2, color: "#aaa" }}>
              (Loading foods...)
            </Typography>
          )}
        </Typography>

        {ingredients.map((ing) => (
          <IngredientRow 
            key={ing.tempId} 
            ingredient={ing} 
            updateIngredient={updateIngredient} 
            removeIngredient={removeIngredient} 
            inputStyles={inputStyles} 
            foodOptions={allFoodOptions} 
          />
        ))}

        <Button
          variant="outlined"
          onClick={addIngredient}
          disabled={loadingFoods}
          sx={{
            color: "#67E67C",
            borderColor: "#67E67C",
            "&:hover": {
              borderColor: "#429d51",
              backgroundColor: "rgba(103, 230, 124, 0.1)",
            },
          }}
        >
          {loadingFoods ? "Loading Foods..." : "+ Add Ingredient"}
        </Button>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error: {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          sx={{
            mt: 4,
            mb: 4,
            backgroundColor: "#67E67C",
            color: "black",
            "&:hover": { backgroundColor: "#429d51" },
          }}
          disabled={loading || ingredients.length === 0 || !recipeDetails.name || loadingFoods}
        >
          {loading ? "UPDATING RECIPE..." : "UPDATE RECIPE"}
        </Button>
      </Box>
    </Box>
  );
}