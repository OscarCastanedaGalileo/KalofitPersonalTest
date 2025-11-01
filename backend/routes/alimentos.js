
const express = require('express');
const router = express.Router();
const { Alimento, Medida } = require('../models');

router.get('/', async (req, res) => {
  try {
    const alimentos = await Alimento.findAll({
      include: {
        model: Medida,
        as: 'medidas', 
      },
      order: [['nombre', 'ASC']] 
    });
    res.json(alimentos);
  } catch (error) {
    console.error("Error al obtener alimentos:", error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;