const env = require("../config/env");
const { HttpError, CODES, toHttpError } = require("../errors/types");

const LAYER = "middleware";

function jsonError(err, _req, _res, next) {
  if (err instanceof SyntaxError && "body" in err) {
    return next(toHttpError(err));
  }
  next(err);
}

function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`, CODES.NOT_FOUND));
}

function errorHandler(err, _req, res, _next) {
  const httpError = toHttpError(err);
  const payload = {
    error: httpError.message,
    status: httpError.status,
    code: httpError.code,
  };

  if (httpError.details && env.nodeEnv !== "production") {
    payload.details = httpError.details;
  }
  if (env.nodeEnv !== "production" && httpError.status >= 500) {
    payload.stack = err.stack;
  }
  if (httpError.status >= 500) {
    console.error(err);
  }

  res.status(httpError.status).json(payload);
}

function beforeRoutes(app) {
  app.use(jsonError);
}

function afterRoutes(app) {
  app.use(notFound);
  app.use(errorHandler);
}

module.exports = {
  LAYER,
  jsonError,
  notFound,
  errorHandler,
  beforeRoutes,
  afterRoutes,
};
