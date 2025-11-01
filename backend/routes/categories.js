const express = require("express");
const router = express.Router();

const { FoodCategory, User } = require("../models");

const resolveUserId = (req) => req.user?.id || 1;

router.post("/", async (req, res) => {
  try {
    const { name, createdBy } = req.body || {};
    if (!name) return res.status(400).json({ message: "name es requerido" });

    const userId = createdBy ?? resolveUserId(req);

    const userExists = await User.findByPk(userId);
    if (!userExists) return res.status(400).json({ message: "createdBy (userId) no existe" });

    const exists = await FoodCategory.findOne({ where: { name: String(name).trim(), createdBy: userId } });
    if (exists) return res.status(409).json({ message: "Ya existe una categoría con ese nombre para este usuario" });

    const category = await FoodCategory.create({
      name: String(name).trim(),
      createdBy: userId,
    });

    return res.status(201).json(category);
  } catch (err) {
    const pg = err?.parent || {};
    return res.status(400).json({
      message: err.message,
      code: pg.code,
      detail: pg.detail,
      constraint: pg.constraint,
    });
  }
});

router.get("/", async (req, res) => {
  const createdBy = req.query.createdBy ?? resolveUserId(req);

  const where = createdBy ? { createdBy: Number(createdBy) } : {};
  const categories = await FoodCategory.findAll({
    where,
    attributes: ["id", "name", "createdBy", "createdAt", "updatedAt"],
    order: [["id", "ASC"]],
  });

  res.json(categories);
});

module.exports = router;
