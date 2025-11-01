import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  IconButton, // Importamos IconButton para el botón de retroceso
  Grid, // Importamos Grid para mantener consistencia, aunque no lo usemos para layout
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Icono de flecha
import { useParams, useNavigate } from "react-router";
import { backendClient } from "../api/backendClient";

const BASE = import.meta.env.VITE_API_BASE_URL;

export default function EditFood() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [foodData, setFoodData] = useState({
    name: "",
    caloriesPerGram: "",
    foodCategoryId: "",
  });
  const [categories, setCategories] = useState([]);

  // Fetching and state management functions (Funcionalidad intacta)
  useEffect(() => {
    backendClient.get('/food-categories')
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    backendClient.get(`/foods/${id}`)
    .then((data) =>
        setFoodData({
          name: data.name,
          caloriesPerGram: data.caloriesPerGram,
          foodCategoryId: data.foodCategoryId,
        })
      )
      .catch((err) => console.error("Error fetching food data:", err));
  }, [id]);

  const handleChange = (field) => (e) => {
    setFoodData({ ...foodData, [field]: e.target.value });
  };

  const handleUpdateFood = async (e) => {
    e.preventDefault();

    const payload = {
      ...foodData,
      caloriesPerGram: Number(foodData.caloriesPerGram),
      foodCategoryId: Number(foodData.foodCategoryId),
    };

    console.log("Updating food with:", payload);

    try {

      await backendClient.put(`foods/${id}`, payload)
        alert("Food updated successfully!");
        navigate("/foods-list");
    } catch (error) {
      console.error("Server error", error);
      alert("Server error");
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#122B2A",
      color: "white",
      "& fieldset": { borderColor: "#777" },
      "&:hover fieldset": { borderColor: "#777" },
    },
    // Estilo para el label
    "& .MuiInputLabel-root": {
      color: "#aaa",
    },
    // Estilo para el texto cuando está enfocado
    "& .Mui-focused .MuiInputLabel-root": {
      color: "#38b000", // Color verde de enfoque
    },
    // Estilo para el borde cuando está enfocado
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#67E67C !important",
    },
  };

  return (
    // ✅ 1. Contenedor principal con fondo mate y ancho máximo
    <Box
      sx={{
        p: 2, // Ajustamos a p:2 para que coincida con FoodsList
        backgroundColor: "#122B2A",
        minHeight: "100vh",
        color: "white",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      {/* ✅ 2. Encabezado de Navegación idéntico */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, py: 1 }}>
        <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Edit Food
        </Typography>
        <Box sx={{ width: 48 }} /> {/* Espacio vacío para centrar el título */}
      </Box>

      {/* 3. Formulario */}
      <Box
        component="form"
        onSubmit={handleUpdateFood}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3, // Aumentamos el espacio entre campos
          maxWidth: "100%", // Usamos el 100% del ancho para alineación
          mx: "auto", // Centramos
        }}
      >
        <TextField
          label="Food Name"
          value={foodData.name}
          onChange={handleChange("name")}
          required
          fullWidth
          sx={inputStyles} // ✅ Aplicamos estilos oscuros
        />

        <TextField
          label="Calories per Gram"
          type="number"
          value={foodData.caloriesPerGram}
          onChange={handleChange("caloriesPerGram")}
          required
          fullWidth
          sx={inputStyles} // ✅ Aplicamos estilos oscuros
        />

        <TextField
          select
          label="Category"
          value={foodData.foodCategoryId}
          onChange={handleChange("foodCategoryId")}
          required
          fullWidth
          sx={inputStyles} // ✅ Aplicamos estilos oscuros
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        {/* ✅ 4. Botón con estilo consistente */}
        <Button type="submit" variant="contained" size="large" sx={{ backgroundColor: "#67E67C", color: "black", "&:hover": { backgroundColor: "#429d51" }, mt: 2 }}>
          Update Food
        </Button>
      </Box>
    </Box>
  );
}
