var express = require("express");
var router = express.Router();
var { FoodCategory } = require("../models");

// GET all food categories
router.get("/", async (req, res) => {
  try {
    const categories = await FoodCategory.findAll();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching food categories" });
  }
});

module.exports = router;
