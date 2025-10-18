import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
const BASE = import.meta.env.VITE_API_BASE_URL;
const RegisterFood = () => {
  const [food, setFood] = useState("");
  const [caloriesPerGram, setCaloriesPerGram] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const user = 1; // id from the logged user, will be replaced according to real context
  const isCustom = true; // always true for user-created foods

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE}/food-categories`); // endpoint for categories
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleRegister = async () => {
    if (!categoryId) {
      alert("Please select a category");
      return;
    }

    const data = {
      name: food,
      caloriesPerGram: parseFloat(caloriesPerGram),
      foodCategoryId: categoryId, // send the correct id
      createdBy: user,
      isCustom,
    };

    try {
      const response = await fetch(`${BASE}/foods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("New Food Registered Successfully!");
        setFood("");
        setCaloriesPerGram("");
        setCategoryId("");
      } else {
        const err = await response.json();
        alert("Error registering food: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Server connection error");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "0 auto", padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Register New Food
      </Typography>

      <TextField label="Food Name" fullWidth margin="normal" value={food} onChange={(e) => setFood(e.target.value)} />

      <TextField label="Calories per gram" type="number" fullWidth margin="normal" value={caloriesPerGram} onChange={(e) => setCaloriesPerGram(e.target.value)} />

      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)} // this will be the category id
          label="Category"
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name} {/* what the user sees */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleRegister}>
        Register
      </Button>
    </Box>
  );
};

export default RegisterFood;
