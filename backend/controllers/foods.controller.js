const db  = require("../config/database");   // ajusta a tu helper (pg/knex/etc.)
const logger = require("../config/logger");
const FDC = require("../services/fdc.service");

// kcal = nutriente 208 (Energy)
function extractKcal(foodNutrients = []) {
  const n = foodNutrients.find(
    x => x?.nutrientNumber === "208" || /energy/i.test(x?.nutrientName || "")
  );
  return n?.value ?? null;
}

// GET /api/foods?q=manzana&page=1&size=25
exports.search = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 25);
    if (!q) return res.status(400).json({ error: "query param q required" });

    // 1) cache local
    // const local = await db.query(
      // `SELECT id, name, fdc_id, kcal_per_100g
      //  FROM catalogue_foods
      //  WHERE name ILIKE $1
      //  ORDER BY name
      //  LIMIT $2 OFFSET $3`,
      // [`%${q}%`, size, (page - 1) * size]
    // );
    // if (local.rows?.length) return res.json({ source: "local", foods: local.rows });

    // 2) FDC
    const r = await FDC.searchFoods(q, page, size);
    logger.info(`[fdc] search "${q}" found ${r.totalHits} items (page ${page} size ${size})`);
    // const foods = (r.foods || []).map(f => ({
      // fdc_id: f.fdcId,
      // name: f.description,
      // kcal_per_100g: extractKcal(f.foodNutrients),
    // }));
//
    // 3) guardar algunos en cache
    // for (const it of foods.filter(x => x.kcal_per_100g != null)) {
      // await db.query(
        // `INSERT INTO catalogue_foods (source, fdc_id, name, kcal_per_100g)
        //  VALUES ('FDC',$1,$2,$3) ON CONFLICT (fdc_id) DO NOTHING`,
        // [it.fdc_id, it.name, it.kcal_per_100g]
      // );
    // }

    res.json({ source: "fdc", r });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
};

// GET /api/foods/:id
exports.getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

    const local = await db.query(
      `SELECT id, name, fdc_id, kcal_per_100g FROM catalogue_foods WHERE fdc_id = $1`,
      [id]
    );
    if (local.rows?.[0]) return res.json({ source: "local", food: local.rows[0] });

    const f = await FDC.foodById(id);
    const kcal = extractKcal(f.foodNutrients);
    if (kcal != null) {
      await db.query(
        `INSERT INTO catalogue_foods (source, fdc_id, name, kcal_per_100g)
         VALUES ('FDC',$1,$2,$3) ON CONFLICT (fdc_id) DO NOTHING`,
        [f.fdcId, f.description, kcal]
      );
    }
    res.json({ source: "fdc", food: { fdc_id: f.fdcId, name: f.description, kcal_per_100g: kcal } });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
};
