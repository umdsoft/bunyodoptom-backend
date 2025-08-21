require("dotenv").config();
require("./db");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const path = require("path");
const xss = require("xss");

const logger = require("./config/logger");
const apiRoutes = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(hpp());

// ❌ xss-clean yo‘q!
// ✅ joyida tozalovchi sanitizer
app.use((req, _res, next) => {
  const cleanse = (val) => {
    if (typeof val === "string") return xss(val);
    if (Array.isArray(val)) return val.map(cleanse);
    if (val && typeof val === "object") {
      for (const k of Object.keys(val)) val[k] = cleanse(val[k]);
      return val;
    }
    return val;
  };
  if (req.query) cleanse(req.query);
  if (req.body) cleanse(req.body);
  if (req.params) cleanse(req.params);
  next();
});
app.use(
  pinoHttp({
    logger,
    // 1) /docs, /health, /favicon.ico ni loglamaymiz
    autoLogging: {
      ignore: (req) =>
        req.url.startsWith("/docs") ||
        req.url.startsWith("/health") ||
        req.url.startsWith("/favicon.ico"),
    },
    // 2) Juda ixcham serializerlar (req/res obyektlarini to'liq chiqarmaydi)
    serializers: {
      req(req) {
        return { method: req.method, url: req.url };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
    // 3) Log levelni statusga qarab qo'yish
    customLogLevel: function (req, res, err) {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    // 4) Yakunda bitta ixcham “completed” log yozamiz
    customSuccessMessage: function (req, res) {
      return `${req.method} ${req.url} -> ${res.statusCode}`;
    },
    customErrorMessage: function (req, res, err) {
      return `${req.method} ${req.url} -> ${res.statusCode} ${
        err && err.message
      }`;
    },
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(pinoHttp({ logger }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads"))
);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/v1", apiRoutes);

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => logger.info(`E'nga Server http://localhost:${PORT}`));
