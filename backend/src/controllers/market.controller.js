const marketService = require("../services/market.service");
const { wrapAll } = require("./error");

async function overview(_req, res) {
  res.json(await marketService.getOverview());
}

async function listings(req, res) {
  res.json(await marketService.getListings(req.query));
}

module.exports = wrapAll({
  overview,
  listings,
});
