const serviceErrors = require("../services/error");
const controllerErrors = require("../controllers/error");
const routeErrors = require("../routes/error");
const middlewareErrors = require("../middleware/error");

let started = false;

function initErrorHandling() {
  if (started) {
    return getStatus();
  }
  started = true;

  process.on("unhandledRejection", (reason) => {
    console.error("[errors:process] unhandledRejection", reason);
  });
  process.on("uncaughtException", (error) => {
    console.error("[errors:process] uncaughtException", error);
    process.exit(1);
  });

  const status = getStatus();
  console.log(`Error handling ready: ${status.layers.join(" → ")}`);
  return status;
}

function attachToApp(app) {
  initErrorHandling();
  middlewareErrors.beforeRoutes(app);
  return app;
}

function attachAfterRoutes(app) {
  middlewareErrors.afterRoutes(app);
  return app;
}

function getStatus() {
  return {
    ready: started,
    layers: [
      serviceErrors.LAYER,
      controllerErrors.LAYER,
      routeErrors.LAYER,
      middlewareErrors.LAYER,
    ],
  };
}

module.exports = {
  initErrorHandling,
  attachToApp,
  attachAfterRoutes,
  getStatus,
};
