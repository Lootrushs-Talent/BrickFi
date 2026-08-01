const watchlistService = require("../services/watchlist.service");
const { wrapAll } = require("./error");

async function list(req, res) {
  res.json(watchlistService.getWatchlist(req.params.address));
}

async function add(req, res) {
  const { address, propertyId } = req.body;
  res.status(201).json(watchlistService.addToWatchlist(address, propertyId));
}

async function remove(req, res) {
  const address = req.body.address || req.query.address;
  const propertyId = req.body.propertyId || req.query.propertyId;
  res.json(watchlistService.removeFromWatchlist(address, propertyId));
}

module.exports = wrapAll({
  list,
  add,
  remove,
});
