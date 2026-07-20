const { readJson, writeJson } = require("../utils/store");
const { normalizeAddress } = require("../utils/eth");

const FILE = "watchlist.json";

function load() {
  return readJson(FILE, {});
}

function list(address) {
  const key = normalizeAddress(address);
  return load()[key] || [];
}

function add(address, propertyId) {
  const key = normalizeAddress(address);
  const data = load();
  const current = new Set(data[key] || []);
  current.add(Number(propertyId));
  data[key] = [...current];
  writeJson(FILE, data);
  return data[key];
}

function remove(address, propertyId) {
  const key = normalizeAddress(address);
  const data = load();
  data[key] = (data[key] || []).filter((id) => id !== Number(propertyId));
  writeJson(FILE, data);
  return data[key];
}

module.exports = {
  list,
  add,
  remove,
};
