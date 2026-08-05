const { AppError, HttpError, toHttpError } = require("../errors/types");

const LAYER = "controller";

function withController(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(toHttpError(error));
    }
  };
}

function wrapAll(handlers) {
  return Object.fromEntries(
    Object.entries(handlers).map(([name, fn]) => [name, withController(fn)])
  );
}

function ignoreUnavailable(error) {
  if (error instanceof AppError && error.code === "UNAVAILABLE") return null;
  throw error;
}

module.exports = {
  LAYER,
  AppError,
  HttpError,
  toHttpError,
  withController,
  wrapAll,
  ignoreUnavailable,
};
