var express = require('express');
const logger = require('../config/logger');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  logger.info({ ip: req.clientIp, reqId: req.id });
  res.send('respond with a resource');
});

module.exports = router;
