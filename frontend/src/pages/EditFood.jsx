import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router";
const BASE = import.meta.env.VITE_API_BASE_URL;

export default function EditFood() {
  const { id } = useParams(); // gets the id from the URL
  const navigate = useNavigate();

  const [foodData, setFoodData] = useState({
    name: "",
    caloriesPerGram: "",
    foodCategoryId: "",
  });
  const [categories, setCategories] = useState([]);

  // Trae categorías
  useEffect(() => {
    fetch(`${BASE}/food-categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Brings food data by id
  useEffect(() => {
    fetch(`${BASE}/foods/${id}`)
      .then((res) => res.json())
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

    // assures that they are sent as numbers
    const payload = {
      ...foodData,
      caloriesPerGram: Number(foodData.caloriesPerGram),
      foodCategoryId: Number(foodData.foodCategoryId),
    };

    console.log("Updating food with:", payload);

    try {
      const res = await fetch(`${BASE}/foods/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Food updated successfully!");
        navigate("/foods"); // redirects to the list
      } else {
        const errData = await res.json();
        console.error("Error response:", errData);
        alert("Error updating food");
      }
    } catch (error) {
      console.error("Server error", error);
      alert("Server error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Edit Food
      </Typography>
      <Box
        component="form"
        onSubmit={handleUpdateFood}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 400,
        }}
      >
        <TextField label="Food Name" value={foodData.name} onChange={handleChange("name")} required />
        <TextField label="Calories per Gram" type="number" value={foodData.caloriesPerGram} onChange={handleChange("caloriesPerGram")} required />
        <TextField select label="Category" value={foodData.foodCategoryId} onChange={handleChange("foodCategoryId")} required>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained">
          Update Food
        </Button>
      </Box>
    </Box>
  );
}
