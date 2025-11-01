import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // BACK ARROW ICON
import { useNavigate } from "react-router";
import { backendClient } from "../api/backendClient";

const BASE = import.meta.env.VITE_API_BASE_URL;

const RegisterFood = () => {
  const [food, setFood] = useState("");
  const [caloriesPerGram, setCaloriesPerGram] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();
  const user = 1;
  const isCustom = true;

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // const res = await fetch(`${BASE}/food-categories`);
        const data = await backendClient.get('/food-categories');
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
      foodCategoryId: categoryId,
      createdBy: user,
      isCustom,
    };

    try {

      await backendClient.post('/foods', data)

        alert("New Food Registered Successfully!");
        // REDIRECTS TO THE FOODS LIST PAGE IF SUCCESSFUL
        navigate("/foods-list");
    } catch (error) {
      console.error(error);
      alert("Server connection error");
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, py: 1 }}>
        <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Register Food
        </Typography>
        <Box sx={{ width: 48 }} />
      </Box>

      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: "100%",
          mx: "auto",
        }}
      >
        <TextField label="Food Name" fullWidth margin="normal" value={food} onChange={(e) => setFood(e.target.value)} sx={inputStyles} />

        <TextField label="Calories per gram" type="number" fullWidth margin="normal" value={caloriesPerGram} onChange={(e) => setCaloriesPerGram(e.target.value)} sx={inputStyles} />

        <FormControl fullWidth margin="normal" sx={inputStyles}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} label="Category">
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{
            mt: 2,
            backgroundColor: "#67E67C",
            color: "black",
            "&:hover": { backgroundColor: "#429d51" },
          }}
          onClick={handleRegister}
        >
          REGISTER FOOD
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterFood;
