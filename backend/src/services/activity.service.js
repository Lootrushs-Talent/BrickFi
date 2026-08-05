const propertyService = require("./property.service");
const activityRepository = require("../repositories/activity.repository");
const { isTxHash } = require("../utils/eth");
const { AppError } = require("./error");

const TYPES = new Set(["watch", "quote", "buy_intent", "buy_confirmed", "note"]);

function list(query) {
  return activityRepository.list(query);
}

function create(body) {
  if (!body?.address || !body?.propertyId || !body?.type) {
    throw AppError.validation("address, propertyId, and type are required");
  }
  if (!TYPES.has(body.type)) {
    throw AppError.validation(`type must be one of: ${[...TYPES].join(", ")}`);
  }
  if (body.txHash && !isTxHash(body.txHash)) {
    throw AppError.validation("txHash must be a 32-byte hex string");
  }
  propertyService.getById(body.propertyId);
  return activityRepository.create(body);
}

module.exports = {
  list,
  create,
};
