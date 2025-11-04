const { FoodLog, Food, Unit, Tag, User } = require("../models");
const { Op } = require("sequelize");
const { DateTime } = require("luxon");
const logger = require("../config/logger");

function parseFlexibleDate(value) {
  if (!value) return DateTime.now();

  let date;

  // Si es un objeto Date de JavaScript
  if (value instanceof Date) {
    date = DateTime.fromJSDate(value);
  }
  // Si es un string, intentar diferentes formatos
  else if (typeof value === 'string') {
    // Intentar formato ISO primero
    date = DateTime.fromISO(value);

    // Si no funciona, intentar formato YYYY-MM-DD HH:mm:ss (con espacio)
    if (!date.isValid) {
      date = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss');
    }

    // Si no funciona, intentar formato YYYY-MM-DD
    if (!date.isValid) {
      date = DateTime.fromFormat(value, 'yyyy-MM-dd');
    }

    // Si aún no funciona, intentar formato DD/MM/YYYY
    if (!date.isValid) {
      date = DateTime.fromFormat(value, 'dd/MM/yyyy');
    }

    // Si aún no funciona, intentar formato MM/DD/YYYY
    if (!date.isValid) {
      date = DateTime.fromFormat(value, 'MM/dd/yyyy');
    }
  }

  // Si no se pudo parsear, devolver fecha actual
  return date && date.isValid ? date : DateTime.now();
}

module.exports = {
    async exportUserHistory(req, res) {
        try {
        const userId = req.user.id; // Usuario autenticado
        const { format, dateRange } = req.query;

        // Calcular rango de fechas
        let startDate, endDate;
        switch(dateRange) {
            case 'last-7-days':
            startDate = DateTime.now().minus({ days: 7 }).startOf('day');
            endDate = DateTime.now().endOf('day');
            break;
            case 'last-30-days':
            startDate = DateTime.now().minus({ days: 30 }).startOf('day');
            endDate = DateTime.now().endOf('day');
            break;
            case 'custom':
            if (req.query.fromDate && req.query.toDate) {
                startDate = parseFlexibleDate(req.query.fromDate).startOf('day');
                endDate = parseFlexibleDate(req.query.toDate).endOf('day');
            }
            break;
            case 'all-history':
            default:
            startDate = DateTime.fromISO('2000-01-01').startOf('day');
            endDate = DateTime.now().endOf('day');
        }

        // Obtener registros
        const foodLogs = await FoodLog.findAll({
            where: {
            userId,
            consumedAt: {
                [Op.between]: [startDate.toJSDate(), endDate.toJSDate()]
            },
            deletedAt: null
            },
            include: [
            {
                model: Food,
                as: "food",
                attributes: ['name']
            },
            {
                model: Unit,
                as: "unit",
                attributes: ['name']
            },
            {
                model: Tag,
                as: "tags",
                through: { attributes: [] },
                attributes: ['name']
            }
            ],
            order: [['consumedAt', 'ASC']]
        });

        // Formatear datos para exportación
        const exportData = foodLogs.map(log => ({
            date: DateTime.fromJSDate(log.consumedAt).toFormat('yyyy-MM-dd'),
            time: DateTime.fromJSDate(log.consumedAt).toFormat('HH:mm'),
            food: log.food?.name || 'Custom entry',
            quantity: log.quantity || 0,
            unit: log.unit?.name || 'grams',
            grams: log.grams || 0,
            calories: log.totalCalories || 0,
            tags: log.tags?.map(t => t.name).join(', ') || '',
            notes: log.notes || ''
        }));

        // Enviar respuesta
        res.json({
            data: exportData,
            metadata: {
            userId,
            exportDate: DateTime.now().toISO(),
            dateRange: {
                from: startDate.toFormat('yyyy-MM-dd'),
                to: endDate.toFormat('yyyy-MM-dd')
            },
            totalEntries: exportData.length
            }
        });

        } catch (error) {
        logger.error(`Error exporting user history: ${error.message}`);
        res.status(500).json({ error: "Error generating export" });
        }
    }
};
