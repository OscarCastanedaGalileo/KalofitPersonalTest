const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

const VALID_PERIODS = new Set(["day", "week", "month"]);

async function aggregateCalories({ userId, period, from, to }) {
  const p = VALID_PERIODS.has(period) ? period : "day";

  const sql = `
    SELECT
      date_trunc(:p, "consumedAt")::timestamptz AS "bucket",
      COALESCE(SUM("totalCalories"), 0)            AS "calories"
    FROM "FoodLogs"
    WHERE "userId"   = :userId
      AND "consumedAt" >= :from
      AND "consumedAt" <  :to
      AND "deletedAt" IS NULL
    GROUP BY 1
    ORDER BY 1;
  `;

  const rows = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: { p, userId, from, to },
  });

  const total = rows.reduce((acc, r) => acc + Number(r.calories || 0), 0);

  return {
    rows: rows.map((r) => ({ bucket: r.bucket, calories: Number(r.calories) })),
    total,
  };
}

module.exports = { aggregateCalories };
