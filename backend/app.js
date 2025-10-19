  var express = require("express");
  var path = require("path");
  var bodyParser = require('body-parser');
  var cookieParser = require("cookie-parser");
  var morgan = require("morgan");
  const logger = require("./config/logger");
  const cors = require("cors");
  require("dotenv").config();

  var indexRouter = require("./routes/index");
  var usersRouter = require("./routes/users");
  var foodsRouter = require("./routes/foods");
  var foodCategoriesRouter = require("./routes/foodCategories");
  var authRouter = require('./routes/auth');
  var foodLogRouter = require('./routes/foodLogs');

  const sequelize = require("./config/database");
  const foodsApiRouter = require("./routes/foods.route");

  const startDatabase = async () => {
    try {
      await sequelize.authenticate();
      logger.info("Connection to the database has been established successfully.");
    } catch (error) {
      logger.error("Unable to connect to the database:", error);
    }
  };

  sequelize.sync({alter: true})
  .then(() => console.log("Database synced"))
  .catch(err => console.log("Error syncing database:", err));

  startDatabase();

  var app = express();

  app.set('trust proxy', true);
  app.use(express.json());

app.use(cors({
  origin: "*",
}));


  // Middleware para asignar reqId e IP limpia
  app.use((req, res, next) => {
    req.id = crypto.randomUUID();
    const rawIp = (req.ip || req.connection?.remoteAddress || '').toString();
    req.clientIp = rawIp;
    next();
  });


  // Morgan personalizado en JSON -> Winston
  app.use(
    morgan((tokens, req, res) => {
      const logObj = {
        timestamp: new Date().toISOString(),
        level: 'info',
        pid: process.pid,
        ip: req.clientIp,
        reqId: req.id,
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseTime: parseFloat(tokens['response-time'](req, res)),
        userAgent: tokens['user-agent'](req, res),
      };
      return JSON.stringify(logObj);
    }, {
      stream: {
        write: (message) => {
          // convierte el string JSON de Morgan a objeto y lo pasa a Winston
          try {
            const data = JSON.parse(message);
            logger.info(data.message || `${data.method} ${data.url} ${data.status}`, data);
          } catch {
            logger.info(message.trim());
          }
        },
      },
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, "public")));

  app.use("/", indexRouter);
  app.use("/users", usersRouter);
  app.use("/foods", foodsRouter); // router used here
  app.use("/api/foods", foodsApiRouter);
  app.use("/food-categories", foodCategoriesRouter);
  app.use('/auth', authRouter);
  app.use('/food-logs', foodLogRouter);

  module.exports = app;
