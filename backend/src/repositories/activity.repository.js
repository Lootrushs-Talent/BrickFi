const { readJson, writeJson } = require("../utils/store");
const { normalizeAddress } = require("../utils/eth");

const FILE = "activity.json";

function load() {
  return readJson(FILE, []);
}

function list({ address, propertyId, limit = 50 } = {}) {
  let rows = load();
  if (address) {
    const key = normalizeAddress(address);
    rows = rows.filter((row) => row.address === key);
  }
  if (propertyId) {
    rows = rows.filter((row) => Number(row.propertyId) === Number(propertyId));
  }
  return rows.slice(0, Number(limit) || 50);
}

function create(entry) {
  const rows = load();
  const record = {
    id: rows.length ? rows[0].id + 1 : 1,
    address: normalizeAddress(entry.address),
    propertyId: Number(entry.propertyId),
    type: entry.type,
    shares: entry.shares != null ? Number(entry.shares) : null,
    txHash: entry.txHash || null,
    note: entry.note || "",
    createdAt: new Date().toISOString(),
  };
  rows.unshift(record);
  writeJson(FILE, rows);
  return record;
}

module.exports = {
  list,
  create,
};
