const { AppError, CODES } = require("../errors/types");

const LAYER = "service";

const errorConfig = require("./errorHandling.config")

function handle(error) {
  if (error instanceof AppError) return error;
  return AppError.unavailable(error.message || "Service failed", { cause: error.message });
}

function run(fn) {
  try {
    return fn();
  } catch (error) {
    throw handle(error);
  }
}

async function runAsync(fn) {
  try {
    return await fn();
  } catch (error) {
    throw handle(error);
  }
}

module.exports = {
  LAYER,
  AppError,
  CODES,
  handle,
  run,
  runAsync,
};
