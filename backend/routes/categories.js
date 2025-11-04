const express = require("express");
const router = express.Router();

const { FoodCategory, User } = require("../models");

const resolveUserId = (req) => req.user?.id || 1;

router.post("/", async (req, res) => {
  try {
    const { name, createdBy } = req.body || {};
    if (!name) return res.status(400).json({ message: "name is required" });

    const userId = createdBy ?? resolveUserId(req);

    const userExists = await User.findByPk(userId);
    if (!userExists) return res.status(400).json({ message: "Invalid user" });

    const exists = await FoodCategory.findOne({ where: { name: String(name).trim(), createdBy: userId } });
    if (exists) return res.status(409).json({ message: "There is an existing category with that name for this user" });

    // create without isPublic — that feature is being removed
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
//categorias por usuario
router.get("/", async (req, res) => {
  const userId = resolveUserId(req);
  const categories = await FoodCategory.findAll({
    attributes: ['id', 'name', 'createdBy', 'createdAt', 'updatedAt'],
    include: [{model: User, as: 'creator', attributes: ['name']}],
    order: [['id', 'ASC']],
  });
  console.log({
    categories
  });
  res.json(categories);
});

// NOTE: public categories endpoint removed — isPublic is being deprecated.
//categorias por id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const category = await FoodCategory.findByPk(id, {
    include: [{model: User, as: 'creator', attributes: ['name']}],
  });
  if (!category) return res.status(404).json({ message: "Category not found" });
  // Access: only creator can access unless further authorization is added.
  const userId = resolveUserId(req);
  if (category.createdBy !== userId) {
    return res.status(403).json({ message: "Access denied to this category" });
  }
  res.json(category);
}
);
//Actualizar categoria por dueño
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await FoodCategory.findByPk(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });
    await category.update({ name });
    res.json(category);
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
//Eliminar categoria por dueño
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await FoodCategory.findByPk(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    await category.destroy();
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting category " });
  }
});



module.exports = router;
