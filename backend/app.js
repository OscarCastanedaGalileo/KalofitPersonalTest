var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var morgan = require("morgan");
const logger = require("./config/logger");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const { APP_ORIGIN = "http://localhost:3000" } = process.env;

const { requireAuth } = require("./middlewares/requireAuth");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// var foodsRouter = require("./routes/foods");
var foodCategoriesRouter = require("./routes/foodCategories");
var authRouter = require("./routes/auth");
var waterRouter = require("./routes/water");
const foodlogsRouter = require("./routes/foodlogs");
const categoriesRouter = require("./routes/categories");
const foodsRouter = require("./routes/foods");
const summaryRouter = require("./routes/summary");
// const sequelize = require("./config/database");
// const foodsApiRouter = require("./routes/foods.route");
const alimentosRouter = require("./routes/alimentos");
const foodunitsRouter = require("./routes/foodunits");
const tagsRouter = require("./routes/tags");
const profileRouter = require("./routes/profile");

const app = express();

app.set("trust proxy", true);
app.use(express.json());

app.use(
  cors({
    origin: APP_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Middleware para asignar reqId e IP limpia
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  const rawIp = (req.ip || req.connection?.remoteAddress || "").toString();
  req.clientIp = rawIp;
  next();
});

// Morgan personalizado en JSON -> Winston
app.use(
  morgan(
    (tokens, req, res) => {
      const logObj = {
        timestamp: new Date().toISOString(),
        level: "info",
        pid: process.pid,
        ip: req.clientIp,
        reqId: req.id,
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseTime: parseFloat(tokens["response-time"](req, res)),
        userAgent: tokens["user-agent"](req, res),
      };
      return JSON.stringify(logObj);
    },
    {
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
    }
  )
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/foods", requireAuth, foodsRouter);
app.use("/food-categories", requireAuth, foodCategoriesRouter);
app.use("/auth", authRouter);
app.use("/water",requireAuth, waterRouter);
app.use('/api/alimentos',requireAuth, alimentosRouter);
app.use("/api/categories", requireAuth, categoriesRouter);
app.use("/api/foodlogs", requireAuth, foodlogsRouter);
app.use("/api/summary", requireAuth, summaryRouter);
app.use("/api/foodunits", requireAuth, foodunitsRouter);
app.use("/api/me/tags", requireAuth, tagsRouter);
app.use("/api/me/profile", requireAuth, profileRouter);
module.exports = app;
