const cron = require('node-cron');
const { Op } = require('sequelize');
const { Reminder, User } = require('../models');
const emailService = require('../services/emailService');
const logger = require('../config/logger');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

/**
 * Recordatorios simplificados usando la zona horaria del servidor (Guatemala)
 * Se ejecuta cada minuto y busca recordatorios para la hora actual del servidor
 */

async function checkAndSendReminders() {
  logger.info('CRON: Checking for reminders to send...');

  try {
    // Calcular la hora actual en la zona horaria del servidor (Guatemala)
    const nowInZone = dayjs().format('HH:mm:00');

    // Buscar todos los recordatorios habilitados para esta hora
    const reminders = await Reminder.findAll({
      where: {
        time: nowInZone,
        isEnabled: true,
      },
      include: {
        model: User,
        as: 'user',
        required: true,
        attributes: ['name', 'email'],
      }
    });

    // Enviar los correos
    if (reminders.length > 0) {
      logger.info(`CRON: Found ${reminders.length} reminders at ${nowInZone}`);
      for (const reminder of reminders) {
        await emailService.sendFoodReminder(
          reminder.user.email,
          reminder.user.name,
          reminder.name
        );
      }
    }
  } catch (e) {
    logger.error(`CRON: Failed to process reminders: ${e.message}`);
  }
}

module.exports = {
  // Tarea que se ejecuta cada minuto de cada día
  startReminderJob() {
    logger.info('Starting reminder job. Will run every minute.');
    // '* * * * *' = cada minuto
    cron.schedule('* * * * *', checkAndSendReminders);
  }
};
