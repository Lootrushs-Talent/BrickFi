const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const routes = require("./routes");
const requestLogger = require("./middleware/requestLogger");
const { attachToApp, attachAfterRoutes } = require("./errors/init");

function createApp() {
  const app = express();
  app.use(cors({ origin: env.nodeEnv === "production" ? env.corsOrigin : true }));
  app.use(express.json());
  attachToApp(app);
  app.use(requestLogger);
  app.use("/api", routes);
  attachAfterRoutes(app);
  return app;
}

module.exports = createApp;
