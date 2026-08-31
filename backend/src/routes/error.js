const { HttpError, CODES } = require("../errors/types");
const { isAddress } = require("../utils/eth");

const LAYER = "route";

function forwardErrors(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function requirePropertyId(req, _res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new HttpError(400, "id must be a positive integer", CODES.VALIDATION));
  }
  req.params.id = String(id);
  next();
}

function requireAddressParam(name = "address") {
  return (req, _res, next) => {
    const value = req.params[name];
    if (!isAddress(value)) {
      return next(new HttpError(400, `Invalid Ethereum ${name}`, CODES.VALIDATION));
    }
    next();
  };
}

function requireJsonBody(req, _res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return next(new HttpError(400, "JSON body is required", CODES.VALIDATION));
  }
  next();
}

function requireCartItems(req, _res, next) {
  const items = req.body?.items || req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return next(new HttpError(400, "Cart items are required", CODES.VALIDATION));
  }
  req.body.items = items;
  next();
}

module.exports = {
  LAYER,
  forwardErrors,
  requirePropertyId,
  requireAddressParam,
  requireJsonBody,
  requireCartItems,
};
