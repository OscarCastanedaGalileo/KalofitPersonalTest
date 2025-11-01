const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/requireAuth");
const foodLogController = require("../controllers/foodLogController");

// Apply requireAuth to all routes
router.use(requireAuth);

router.post("/", foodLogController.createFoodLog);
router.get("/", foodLogController.getFoodLogs);
router.get("/date", foodLogController.getByDate);
router.get("/date/detailed", foodLogController.getDetailedByDate);
router.get("/summary/today", foodLogController.getDailyCaloriesSummary);
router.get("/totals", foodLogController.getDateTotals);
router.get("/:id", foodLogController.getFoodLogById);
router.put("/:id", foodLogController.updateFoodLog);
router.delete("/:id", foodLogController.deleteFoodLog);

module.exports = router;
