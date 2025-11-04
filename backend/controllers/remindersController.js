const { Reminder } = require('../models');

module.exports = {
  // GET /api/reminders - Obtiene todos los recordatorios del usuario
  async getReminders(req, res) {
    try {
      const reminders = await Reminder.findAll({
        where: { userId: req.user.id }, // req.user.id viene del middleware de autenticación
        order: [['time', 'ASC']],
      });
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reminders', error: error.message });
    }
  },

  // POST /api/reminders - Crea un nuevo recordatorio
  async createReminder(req, res) {
    try {
      const { name, time } = req.body;
      if (!name || !time) {
        return res.status(400).json({ message: 'Name and time are required' });
      }

      const reminder = await Reminder.create({
        name,
        time,
        userId: req.user.id,
        isEnabled: true,
      });
      res.status(201).json(reminder);
    } catch (error) {
      res.status(500).json({ message: 'Error creating reminder', error: error.message });
    }
  },

  // PUT /api/reminders/:id - Actualiza un recordatorio (ej: para apagarlo)
  async updateReminder(req, res) {
    try {
      const { id } = req.params;
      const { name, time, isEnabled } = req.body;
      const [updated] = await Reminder.update(
        { name, time, isEnabled },
        { 
          where: { id, userId: req.user.id }
        }
      );
      
      if (updated) {
        const updatedReminder = await Reminder.findByPk(id);
        res.json(updatedReminder);
      } else {
        res.status(404).json({ message: 'Reminder not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating reminder', error: error.message });
    }
  },

  // DELETE /api/reminders/:id - Elimina un recordatorio
  async deleteReminder(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Reminder.destroy({
        where: { id, userId: req.user.id },
      });

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Reminder not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error deleting reminder', error: error.message });
    }
  },
};