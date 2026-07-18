const investorService = require("../services/investor.service");
const quoteService = require("../services/quote.service");
const { wrapAll } = require("./error");

async function getProfile(req, res) {
  res.json(investorService.getProfile(req.params.address));
}

async function getPortfolio(req, res) {
  res.json(await investorService.getPortfolio(req.params.address));
}

async function getQuote(req, res) {
  res.json(await quoteService.quote(req.query.propertyId, req.query.shares));
}

module.exports = wrapAll({
  getProfile,
  getPortfolio,
  getQuote,
});
