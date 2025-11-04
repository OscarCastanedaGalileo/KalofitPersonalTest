import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import { backendClient } from "../api/backendClient";

import { getFoods } from "../api";

import IngredientRow from "../components/IngredientRow";

const RecipeCreator = () => {
  const navigate = useNavigate();
  const userId = 1;

  const [recipeDetails, setRecipeDetails] = useState({
    name: "",
    servings: 1,
  });

  const [allFoodOptions, setAllFoodOptions] = useState([]); // Lista COMPLETA de todos los alimentos elegibles
  const [loadingFoods, setLoadingFoods] = useState(true);

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllEligibleFoods = async () => {
      setLoadingFoods(true);
      try {
        
        const foodsData = await getFoods();
        setAllFoodOptions(foodsData);
      } catch (error) {
        console.error("Error loading all food options:", error);
        setError("Error loading food list. Check server connection or BE logs.");
        setAllFoodOptions([]);
      } finally {
        setLoadingFoods(false);
      }
    };
    fetchAllEligibleFoods();
  }, []);

  

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
    setIngredients(ingredients.map((ing) => (ing.tempId === tempId ? { ...ing, [field]: value } : ing)));
  };

  const removeIngredient = (tempId) => {
    setIngredients(ingredients.filter((ing) => ing.tempId !== tempId));
  };

  const handleRegisterRecipe = async (e) => {
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
      userId: userId,
      ingredients: validIngredients,
    };

    try {
      await backendClient.post("/api/recipes", payload);

      alert("Recipe Registered Successfully!");
      navigate("/foods-list");
    } catch (err) {
      const errMsg = err.response?.data?.error || "Server connection error or validation failed.";
      setError(errMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, py: 1 }}>
        <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Create Recipe
        </Typography>
        <Box sx={{ width: 48 }} />
      </Box>

      <Box
        component="form"
        onSubmit={handleRegisterRecipe}
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

        <TextField label="Recipe Name" name="name" fullWidth value={recipeDetails.name} onChange={handleChange} required sx={inputStyles} />

        <TextField label="Servings (Portions)" name="servings" type="number" fullWidth value={recipeDetails.servings} onChange={handleChange} required inputProps={{ min: 1 }} sx={inputStyles} />

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, color: "#67E67C" }}>
          Ingredients
          {loadingFoods && (
            <Typography component="span" variant="body2" sx={{ ml: 2, color: "#aaa" }}>
              (Loading foods...)
            </Typography>
          )}
        </Typography>

        {ingredients.map((ing) => (
          <IngredientRow key={ing.tempId} ingredient={ing} updateIngredient={updateIngredient} removeIngredient={removeIngredient} inputStyles={inputStyles} foodOptions={allFoodOptions} />
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

        {/* MENSAJES DE ESTADO */}
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
          {loading ? "SAVING RECIPE..." : "REGISTER RECIPE"}
        </Button>
      </Box>
    </Box>
  );
};

export default RecipeCreator;
