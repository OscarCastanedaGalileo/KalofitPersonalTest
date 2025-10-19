const db = require("../config/database");
const { FoodLog, Food, Unit, sequelize} = require("../models");
const { Op, Sequelize, where } = require("sequelize");
const logger = require("../config/logger");

module.exports = {
// create a new food log entry
    async createFoodLog(req, res) {
        try {
            const userId = req.user?.id || req.body.userId;
            const payload = {
                userId,
                foodId: req.body.foodId,
                quantity: req.body.quantity,
                unitId: req.body.unitId,
                grams: req.body.grams,
                totalCalories: req.body.totalCalories,
                consumedAt: req.body.consumedAt,
                notes: req.body.notes,
            };
            const newFoodLog = await FoodLog.create(payload);
            res.status(201).json(newFoodLog);
        } catch (error) {
            logger.error(`Error creating food log: ${error.message}`);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    
// get food logs for a user
    async getFoodLogs(req, res) {
        try {
            const userId = req.user?.id || req.query.userId;
            const foodLogs = await FoodLog.findAll({
                where: { userId, deletedAt: null },
                include: [
                    { model: Food, as: "food" },
                    { model: Unit, as: "unit" },
                ],
                order: [['consumedAt', 'DESC']],
            });
            res.json(foodLogs);
        } catch (error) {
            logger.error(`Error fetching food logs: ${error.message}`);
            res.status(500).json({ error: "Internal server error" });
        }
    },
// get entries for a date and total calories
    async getByDate(req, res) {
        try {
            const userId = req.user?.id || req.query.userId;
            const date = req.query.date; // expected format: YYYY-MM-DD
            if (!date) return res.status(400).json({ error: "date query param required" });

            const entries = await FoodLog.findAll({ 
                where: { userId, consumedAt},
                order: [['time', 'ASC'], ['createdAt', 'ASC']]
            });

            const total = entries.reduce((sum,e) => sum + (e.totalCalories || 0), 0);
            
            res.json({ date, totalCalories: total, entries });
        } catch (error) {
            logger.error(`Error fetching food logs by date: ${error.message}`);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    // get history of dates with totals 
    async getDateTotals(req, res) {
        try {
            const userId = req.user?.id || req.query.userId;
            const limit = parseInt(req.query.limit) || 30;
            const offset = parseInt(req.query.offset) || 0;

            const results = await FoodLog.findAll({
                attributes: [
                    'date',
                    [Sequelize.fn('SUM', Sequelize.col('totalCalories')), 'totalCalories']
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'entryCount']
                ],
                where: {userId},
                group: ['date'],
                order: [['date', 'DESC']],
                limit,
                offset,
            });

            res.json(results);
        } catch (error) {
            logger.error(`Error fetching date totals: ${error.message}`);
            res.status(500).json({ error: "Internal server error" });
        }
    },

// soft delete a food log entry
    async deleteFoodLog(req, res) {
        try {
            const userId = req.user?.id || req.body.userId;
            const id = req.params.id;
            const deleted = await FoodLog.destroy({where: { id, userId }});
            if (deleted) {
                res.json({ message: "Food log entry deleted" });
            } else {
                res.status(404).json({ error: "Food log entry not found" });
            }
        } catch (error) {
            logger.error(`Error deleting food log: ${error.message}`);
            res.status(500).json({ error: "Internal server error" });
        }
    },

};