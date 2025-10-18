import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";
const BASE = import.meta.env.VITE_API_BASE_URL;
const FoodsList = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState({});
  const userId = 1; // hardcoded user ID for demo purposes
  const navigate = useNavigate(); // <-- aquí

  // Trae todas las foods
  const fetchFoods = async () => {
    try {
      const res = await fetch(`${BASE}/foods`);
      const data = await res.json();
      setFoods(data);
    } catch (error) {
      console.error("Error fetching foods", error);
    }
  };

  // Trae las categorías y crea un map { id: name }
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE}/food-categories`);
      const data = await res.json();
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
    try {
      const res = await fetch(`${BASE}/foods/${id}`, { method: "DELETE" });
      if (res.ok) fetchFoods();
      else alert("Error deleting food");
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Foods List
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Calories/g</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {foods.map((food) => (
            <TableRow key={food.id}>
              <TableCell>{food.name}</TableCell>
              <TableCell>{food.caloriesPerGram}</TableCell>
              <TableCell>{categories[food.foodCategoryId] || "Unknown"}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={() => navigate(`/log/edit-food/${food.id}`)} // <-- corregido
                >
                  Edit
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(food.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default FoodsList;
