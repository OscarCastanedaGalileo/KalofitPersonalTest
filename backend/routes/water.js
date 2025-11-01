"use strict";
var express = require("express");
var router = express.Router();
const { WaterIntake, User } = require("../models");

// POST Log Water Intake
router.post("/", async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id; //

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Amount is required and must be a positive number." });
  }

  try {
    const newWaterLog = await WaterIntake.create({
      userId,
      mililiters: parseFloat(amount),
      consumedAt: new Date(),
    });

    res.status(201).json({ log: newWaterLog, message: "Water intake logged successfully" });
  } catch (error) {
    console.error("Error saving water log:", error);
    res.status(500).json({ error: "Error saving water log" });
  }
});

// GET Daily Water Consumption Summary
router.get("/summary/today", async (req, res) => {
  const userId = req.user.id;
  const DEFAULT_GOAL = 3000;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: require('../models').Profile,
        as: 'profile'
      }]
    });
    const dailyGoal = user?.profile?.dailyWaterGoal || DEFAULT_GOAL;

    // 2. Sumar el consumo de agua
    const Op = require("sequelize").Op;
    const result = await WaterIntake.sum("mililiters", {
      where: {
        userId: userId,
        consumedAt: {
          [Op.gte]: today,
        },
      },
    });

    // 3. Obtener la fecha del último registro de agua
    const lastWaterEntry = await WaterIntake.findOne({
      where: {
        userId: userId,
      },
      order: [['consumedAt', 'DESC']],
      limit: 1
    });

    const totalConsumed = parseFloat(result || 0);
    const lastConsumedAt = lastWaterEntry ? lastWaterEntry.consumedAt.toISOString() : null;

    res.json({
      totalConsumed: totalConsumed,
      dailyGoal: dailyGoal,
      lastConsumedAt: lastConsumedAt,
      message: "Daily water consumption summary fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching water summary:", error);
    res.status(500).json({ error: "Error fetching water summary" });
  }
});

//GET All Water Logs
router.get("/", async (req, res) => {
  try {
    const allLogs = await WaterIntake.findAll({
      order: [["consumedAt", "DESC"]],
    });
    res.json(allLogs);
  } catch (error) {
    console.error("Error fetching all water logs:", error);
    res.status(500).json({ error: "Error fetching all water logs" });
  }
});

//DELETE Water Log by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const log = await WaterIntake.findByPk(id);
    if (!log) return res.status(404).json({ error: "Water log not found" });

    if (Number(log.userId) !== Number(userId)) {
      return res.status(403).json({ error: "You can only delete your own water logs" });
    }

    await WaterIntake.destroy({ where: { id } });
    res.json({ message: "Water log deleted successfully" });
  } catch (error) {
    console.error("Error deleting water log:", error);
    res.status(500).json({ error: "Error deleting water log" });
  }
});

// PUT Update Water Log by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, consumedAt, note } = req.body;
  const userId = req.user.id;

  try {
    const log = await WaterIntake.findByPk(id);
    if (!log) return res.status(404).json({ error: "Water log not found" });

    if (Number(log.userId) !== Number(userId)) {
      return res.status(403).json({ error: "You can only update your own water logs" });
    }

    // Solo actualizar los campos que se proporcionen
    if (amount !== undefined) {
      log.mililiters = parseFloat(amount);
    }
    if (consumedAt !== undefined) {
      log.consumedAt = new Date(consumedAt);
    }
    if (note !== undefined) {
      log.note = note;
    }

    await log.save();

    res.json({ message: "Water log updated successfully", log });
  } catch (error) {
    console.error("Error updating water log:", error);
    res.status(500).json({ error: "Error updating water log" });
  }
});

module.exports = router;
