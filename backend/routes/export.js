const express = require('express');
const router = express.Router();
const { exportUserHistory } = require('../controllers/exportController');
const { requireAuth } = require('../middlewares/requireAuth');

router.get('/history', requireAuth, exportUserHistory);

module.exports = router;