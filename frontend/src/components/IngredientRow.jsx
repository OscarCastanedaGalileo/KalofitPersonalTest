import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  MenuItem,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getFoodUnitsByFoodId } from "../api";

const IngredientRow = ({ ingredient, updateIngredient, removeIngredient, inputStyles, foodOptions }) => {
  const theme = useTheme();
  const [foodUnits, setFoodUnits] = useState([]);

  // Cargar unidades cuando cambie el foodId
  useEffect(() => {
    const loadUnits = async () => {
      if (!ingredient.foodId) {
        setFoodUnits([]);
        return;
      }
      try {
        const unitsData = await getFoodUnitsByFoodId(ingredient.foodId);
        setFoodUnits(unitsData);
      } catch (err) {
        console.error("Error loading food units:", err);
        setFoodUnits([]);
      }
    };
    loadUnits();
  }, [ingredient.foodId]);

  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid #555",
        borderRadius: 1,
        mb: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {/* FOOD DROPDOWN */}
      <Box sx={{ flexBasis: { xs: "100%", sm: "50%" }, flexGrow: 1 }}>
        <TextField
          select
          label="Food Name"
          fullWidth
          value={ingredient.foodId || ""}
          onChange={(e) => updateIngredient(ingredient.tempId, "foodId", e.target.value)}
          required
          sx={{
            ...inputStyles,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#122B2A",
              color: "white",
            },
          }}
        >
          <MenuItem value="">
            <em>Select Food</em>
          </MenuItem>
          {foodOptions?.map((food) => (
            <MenuItem key={food.id} value={food.id}>
              {food.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* RIGHT SIDE */}
      <Box
        sx={{
          flexBasis: { xs: "100%", sm: "50%" },
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <TextField
          label="Qty"
          type="number"
          value={ingredient.quantity}
          onChange={(e) => updateIngredient(ingredient.tempId, "quantity", e.target.value)}
          required
          inputProps={{ min: 0.1, step: "any" }}
          sx={{
            ...inputStyles,
            flexGrow: 1,
            minWidth: "80px",
          }}
        />

        {/* UNIT DROPDOWN (corregido sin romper carga) */}
        <FormControl fullWidth required disabled={!ingredient.foodId}>
          <InputLabel>Unit</InputLabel>
          <Select
            label="Unit"
            value={ingredient.unitId || ""}
            onChange={(e) =>
              updateIngredient(ingredient.tempId, "unitId", e.target.value)
            }
          >
            {foodUnits.map((fu) => (
              <MenuItem key={fu.id} value={fu.unitId}>
                {fu.unit?.name} ({fu.gramsPerUnit}g per unit)
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select how you will measure this food</FormHelperText>
        </FormControl>

        <IconButton
          onClick={() => removeIngredient(ingredient.tempId)}
          sx={{
            color: "#F44336",
            "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
            flexShrink: 0,
          }}
          aria-label="remove ingredient"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default IngredientRow;
