const express = require("express");
const dayjs = require("dayjs");
const { aggregateCalories } = require("../services/summaryService");

const router = express.Router();
const resolveUserId = (req) => req.user?.id || 1;

router.get("/aggregate", async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    let period = (req.query.period || "day").toLowerCase();
    if (!["day", "week", "month"].includes(period)) period = "day";

    let { from, to } = req.query;
    if (!from || !to) {
      const now = dayjs();
      if (period === "week") {
        from = now.startOf("week").toDate();
        to = now.endOf("week").add(1, "millisecond").toDate();
      } else if (period === "month") {
        from = now.startOf("month").toDate();
        to = now.endOf("month").add(1, "millisecond").toDate();
      } else {
        from = now.startOf("day").toDate();
        to = now.endOf("day").add(1, "millisecond").toDate();
      }
    } else {
      from = new Date(from);
      to = new Date(to);
    }

    const { rows, total } = await aggregateCalories({ userId, period, from, to });

    const days = Math.max(1, dayjs(to).diff(dayjs(from), "day") || 1);

    res.json({
      period,
      from,
      to,
      buckets: rows.map((r) => ({
        bucket: new Date(r.bucket).toISOString(),
        calories: Number(r.calories),
      })),
      totals: { calories: total, avgPerDay: Math.round(total / days) },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
