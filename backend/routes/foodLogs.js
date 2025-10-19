const express = require('express');
const router = express.Router();
const controller = require('../controllers/foodLogController');
const { FoodLog, Food, Unit } = require('../models');

// Create a new food log entry
router.post('/', controller.createFoodLog);

// Get food logs for a user
router.get('/', controller.getFoodLogs);
// Get food log entries by date with total calories
router.get('/by-date', controller.getByDate);

router.delete('/:id', controller.deleteFoodLog);

module.exports = router;
