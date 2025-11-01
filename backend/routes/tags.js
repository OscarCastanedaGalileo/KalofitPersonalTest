const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/requireAuth");
const tagController = require("../controllers/tagController");

// Apply requireAuth to all routes
router.use(requireAuth);

router.get("/", tagController.getTags);

module.exports = router;
