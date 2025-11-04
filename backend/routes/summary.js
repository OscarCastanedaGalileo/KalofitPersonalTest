const express = require("express");
const { DateTime } = require("luxon");
const { aggregateCalories } = require("../services/summaryService");

const router = express.Router();
const resolveUserId = (req) => req.user?.id || 1;

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

router.get("/aggregate", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    let period = (req.query.period || "day").toLowerCase();
    if (!["day", "week", "month"].includes(period)) period = "day";

    let { from, to } = req.query;
    if (!from || !to) {
      const now = DateTime.now();
      if (period === "week") {
        from = now.startOf("week").toJSDate();
        to = now.endOf("week").plus({ milliseconds: 1 }).toJSDate();
      } else if (period === "month") {
        from = now.startOf("month").toJSDate();
        to = now.endOf("month").plus({ milliseconds: 1 }).toJSDate();
      } else {
        from = now.startOf("day").toJSDate();
        to = now.endOf("day").plus({ milliseconds: 1 }).toJSDate();
      }
    } else {
      from = parseFlexibleDate(from).toJSDate();
      to = parseFlexibleDate(to).toJSDate();
    }

    const { rows, total } = await aggregateCalories({ userId, period, from, to });

    const days = Math.max(1, DateTime.fromJSDate(to).diff(DateTime.fromJSDate(from), "days").days || 1);

    res.json({
      period,
      from,
      to,
      buckets: rows.map((r) => ({
        bucket: DateTime.fromJSDate(new Date(r.bucket)).toISO(),
        calories: Number(r.calories),
      })),
      totals: { calories: total, avgPerDay: Math.round(total / days) },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
