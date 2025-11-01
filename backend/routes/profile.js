const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/requireAuth");
const profileController = require("../controllers/profileController");

// Apply requireAuth to all routes
router.use(requireAuth);

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);

module.exports = router;