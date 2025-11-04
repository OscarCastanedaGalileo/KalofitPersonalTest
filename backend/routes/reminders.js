const express = require('express');
const router = express.Router();
const remindersController = require('../controllers/remindersController');
const { requireAuth } = require('../middlewares/requireAuth'); // Asumo que tienes este middleware

// Proteger todas las rutas de recordatorios
router.use(requireAuth);

router.get('/', remindersController.getReminders);
router.post('/', remindersController.createReminder);
router.put('/:id', remindersController.updateReminder);
router.delete('/:id', remindersController.deleteReminder);

module.exports = router;