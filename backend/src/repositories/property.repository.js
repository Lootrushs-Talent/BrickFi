const seed = require("../data/properties");
const { readJson, writeJson } = require("../utils/store");
const slugify = require("../utils/slug");

const EXTRA_FILE = "properties-extra.json";
const OVERRIDES_FILE = "property-overrides.json";

function loadExtra() {
  return readJson(EXTRA_FILE, []);
}

function loadOverrides() {
  return readJson(OVERRIDES_FILE, {});
}

function mergeRecord(base, override = {}) {
  return { ...base, ...override, id: base.id };
}

function all() {
  const extras = loadExtra();
  const overrides = loadOverrides();
  return [...seed, ...extras].map((item) => mergeRecord(item, overrides[String(item.id)]));
}

function findById(id) {
  return all().find((item) => Number(item.id) === Number(id)) || null;
}

function findBySlug(slug) {
  return all().find((item) => item.slug === slug) || null;
}

function nextId() {
  return all().reduce((max, item) => Math.max(max, Number(item.id)), 0) + 1;
}

function create(input) {
  const extras = loadExtra();
  const record = {
    id: nextId(),
    slug: input.slug || slugify(input.name),
    name: input.name,
    location: input.location,
    city: input.city || "",
    country: input.country || "",
    type: input.type || "Residential",
    status: input.status || "draft",
    featured: Boolean(input.featured),
    tokenSymbol: String(input.tokenSymbol || input.name)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 5) || "BRICK",
    occupancyPercent: Number(input.occupancyPercent) || 0,
    description: input.description || "",
    image: input.image || "",
    sqft: Number(input.sqft) || 0,
    beds: Number(input.beds) || 0,
    baths: Number(input.baths) || 0,
    yearBuilt: Number(input.yearBuilt) || new Date().getFullYear(),
    yieldPercent: Number(input.yieldPercent) || 0,
    amenities: Array.isArray(input.amenities) ? input.amenities : [],
  };
  extras.push(record);
  writeJson(EXTRA_FILE, extras);
  return record;
}

function update(id, patch) {
  const current = findById(id);
  if (!current) return null;

  const extras = loadExtra();
  const extraIndex = extras.findIndex((item) => Number(item.id) === Number(id));
  if (extraIndex >= 0) {
    extras[extraIndex] = mergeRecord(extras[extraIndex], patch);
    writeJson(EXTRA_FILE, extras);
    return extras[extraIndex];
  }

  const overrides = loadOverrides();
  overrides[String(id)] = { ...(overrides[String(id)] || {}), ...patch };
  writeJson(OVERRIDES_FILE, overrides);
  return findById(id);
}

module.exports = {
  all,
  findById,
  findBySlug,
  create,
  update,
};
