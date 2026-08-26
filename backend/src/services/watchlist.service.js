const { AppError } = require("./error");
const { normalizeAddress } = require("../utils/eth");
const propertyService = require("./property.service");
const watchlistRepository = require("../repositories/watchlist.repository");

function getWatchlist(address) {
  const checksum = normalizeAddress(address);
  const ids = watchlistRepository.list(checksum);
  return {
    address: checksum,
    propertyIds: ids,
    properties: ids.map((id) => propertyService.getById(id)),
  };
}

function addToWatchlist(address, propertyId) {
  if (propertyId == null || propertyId === "") {
    throw AppError.validation("propertyId is required");
  }
  const checksum = normalizeAddress(address);
  propertyService.getById(propertyId);
  return {
    address: checksum,
    propertyIds: watchlistRepository.add(checksum, propertyId),
  };
}

function removeFromWatchlist(address, propertyId) {
  if (propertyId == null || propertyId === "") {
    throw AppError.validation("propertyId is required");
  }
  const checksum = normalizeAddress(address);
  return {
    address: checksum,
    propertyIds: watchlistRepository.remove(checksum, propertyId),
  };
}

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
