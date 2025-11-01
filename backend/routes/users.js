var express = require('express');
const logger = require('../config/logger');
var router = express.Router();
const { User } = require('../models');
const bcrypt = require("bcrypt");


const sanitizeEmail = (v) =>
  String(v || "")
    .trim()
    .toLowerCase();

router.post("/", async (req, res) => {
  try {
    const { name, email, password, isConfirmed } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email y password son requeridos" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "password debe tener al menos 6 caracteres" });
    }

    const emailNorm = sanitizeEmail(email);

    const exists = await User.findOne({ where: { email: emailNorm } });
    if (exists) {
      return res.status(409).json({ message: "Ya existe un usuario con ese email" });
    }

    const hashPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: String(name).trim(),
      email: emailNorm,
      hashPassword,
      isConfirmed: Boolean(isConfirmed ?? false),
    });

    const { id, createdAt, updatedAt } = user;
    return res.status(201).json({ id, name, email: emailNorm, isConfirmed: !!user.isConfirmed, createdAt, updatedAt });
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

router.get("/", async (_req, res) => {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "isConfirmed", "createdAt", "updatedAt"],
    order: [["id", "ASC"]],
  });
  res.json(users);
});


router.get('/me', async function(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['hashPassword'] },
    });
     logger.info({ ip: req.clientIp, reqId: req.id, userId: req.user.id });
    res.json({ user });
  } catch (error) {
    console.log(error);
    logger.error({ ip: req.clientIp, reqId: req.id, error });
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

module.exports = router;
