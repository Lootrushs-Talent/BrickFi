const propertyService = require("../services/property.service");
const quoteService = require("../services/quote.service");
const contractService = require("../services/contract.service");
const { AppError, wrapAll } = require("./error");
const { normalizeAddress } = require("../utils/eth");

async function list(req, res) {
  res.json(propertyService.list(req.query));
}

async function featured(_req, res) {
  res.json(propertyService.featured());
}

async function stats(_req, res) {
  res.json(propertyService.stats());
}

async function filters(_req, res) {
  res.json(propertyService.filters());
}

async function getBySlug(req, res) {
  res.json(propertyService.getBySlug(req.params.slug));
}

async function getById(req, res) {
  const property = propertyService.getById(req.params.id);
  let onChain = null;
  try {
    onChain = await contractService.getOnChainProperty(property.id);
  } catch (error) {
    if (!(error instanceof AppError)) throw error;
  }
  res.json({ ...property, onChain });
}

async function getChain(req, res) {
  const property = propertyService.getById(req.params.id);
  const onChain = await contractService.getOnChainProperty(property.id);
  res.json({ propertyId: property.id, onChain });
}

async function getShares(req, res) {
  const property = propertyService.getById(req.params.id);
  const address = normalizeAddress(req.params.address);
  const shares = await contractService.getShares(property.id, address);
  res.json({
    propertyId: property.id,
    address,
    shares,
  });
}

async function quote(req, res) {
  const result = await quoteService.quote(req.params.id, req.query.shares || req.body.shares);
  res.json(result);
}

async function create(req, res) {
  const property = propertyService.create(req.body);
  res.status(201).json(property);
}

async function update(req, res) {
  res.json(propertyService.update(req.params.id, req.body));
}

module.exports = wrapAll({
  list,
  featured,
  stats,
  filters,
  getBySlug,
  getById,
  getChain,
  getShares,
  quote,
  create,
  update,
});
