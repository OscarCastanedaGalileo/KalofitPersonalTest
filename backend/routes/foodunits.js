const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/requireAuth");
const foodUnitController = require("../controllers/foodUnitController");

// Apply requireAuth to all routes
router.use(requireAuth);

router.post("/", foodUnitController.createFoodUnit);
router.get("/", foodUnitController.getFoodUnits);
// GET all units (no maintenance, just read)
router.get("/units", foodUnitController.getUnits);
router.get("/:id", foodUnitController.getFoodUnitById);
router.put("/:id", foodUnitController.updateFoodUnit);
router.delete("/:id", foodUnitController.deleteFoodUnit);

module.exports = router;

module.exports = router;
