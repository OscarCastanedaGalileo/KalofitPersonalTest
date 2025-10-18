const express = require("express");
const ctrl = require("../controllers/foods.controller");
const router = express.Router();

router.get("/", ctrl.search);
router.get("/:id", ctrl.getOne);

module.exports = router;