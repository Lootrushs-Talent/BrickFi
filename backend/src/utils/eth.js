const { getAddress, isAddress } = require("ethers");
const { AppError } = require("../services/error");

function normalizeAddress(value, label = "address") {
  if (!value || !isAddress(value)) {
    throw AppError.validation(`Invalid Ethereum ${label}`);
  }
  return getAddress(value);
}

function isTxHash(value) {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value);
}

function toBigIntString(value) {
  return BigInt(value).toString();
}

module.exports = {
  normalizeAddress,
  isTxHash,
  toBigIntString,
  isAddress,
};
