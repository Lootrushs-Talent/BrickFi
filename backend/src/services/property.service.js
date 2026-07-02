const propertyRepository = require("../repositories/property.repository");
const { AppError } = require("./error");
const slugify = require("../utils/slug");

const SORT_FIELDS = new Set(["name", "yieldPercent", "sqft", "yearBuilt", "occupancyPercent"]);

function decorate(property) {
  return {
    ...property,
    modeledIncomeNote: `${property.yieldPercent}% modeled annual yield`,
  };
}

function parseListQuery(query = {}) {
  const q = String(query.q || "").trim().toLowerCase();
  const type = String(query.type || "").trim();
  const country = String(query.country || "").trim();
  const city = String(query.city || "").trim();
  const status = query.status === undefined ? "listed" : String(query.status).trim();
  const featured = query.featured;
  const minYield = query.minYield === undefined ? null : Number(query.minYield);
  const maxYield = query.maxYield === undefined ? null : Number(query.maxYield);
  const sort = SORT_FIELDS.has(query.sort) ? query.sort : "id";
  const order = String(query.order || "asc").toLowerCase() === "desc" ? "desc" : "asc";

  if (minYield != null && Number.isNaN(minYield)) {
    throw AppError.validation("minYield must be a number");
  }
  if (maxYield != null && Number.isNaN(maxYield)) {
    throw AppError.validation("maxYield must be a number");
  }

  return { q, type, country, city, status, featured, minYield, maxYield, sort, order };
}

function list(query = {}) {
  const filters = parseListQuery(query);
  let rows = propertyRepository.all().map(decorate);

  if (filters.q) {
    rows = rows.filter((item) =>
      `${item.name} ${item.location} ${item.city} ${item.description}`.toLowerCase().includes(filters.q)
    );
  }
  if (filters.type) {
    rows = rows.filter((item) => item.type.toLowerCase() === filters.type.toLowerCase());
  }
  if (filters.country) {
    rows = rows.filter((item) => item.country.toLowerCase() === filters.country.toLowerCase());
  }
  if (filters.city) {
    rows = rows.filter((item) => item.city.toLowerCase() === filters.city.toLowerCase());
  }
  if (filters.status && filters.status !== "all") {
    rows = rows.filter((item) => item.status === filters.status);
  }
  if (filters.featured === "true" || filters.featured === true) {
    rows = rows.filter((item) => item.featured);
  }
  if (filters.minYield != null) {
    rows = rows.filter((item) => item.yieldPercent >= filters.minYield);
  }
  if (filters.maxYield != null) {
    rows = rows.filter((item) => item.yieldPercent <= filters.maxYield);
  }

  rows.sort((a, b) => {
    const left = a[filters.sort];
    const right = b[filters.sort];
    if (left < right) return filters.order === "asc" ? -1 : 1;
    if (left > right) return filters.order === "asc" ? 1 : -1;
    return a.id - b.id;
  });

  return rows;
}

function getById(id) {
  const property = propertyRepository.findById(id);
  if (!property) {
    throw AppError.notFound("Property not found");
  }
  return decorate(property);
}

function getBySlug(slug) {
  const property = propertyRepository.findBySlug(slug);
  if (!property) {
    throw AppError.notFound("Property not found");
  }
  return decorate(property);
}

function featured() {
  return list({ featured: "true", status: "listed" });
}

function filters() {
  const rows = propertyRepository.all();
  return {
    types: [...new Set(rows.map((item) => item.type))].sort(),
    countries: [...new Set(rows.map((item) => item.country).filter(Boolean))].sort(),
    cities: [...new Set(rows.map((item) => item.city).filter(Boolean))].sort(),
    statuses: [...new Set(rows.map((item) => item.status))],
  };
}

function stats() {
  const rows = propertyRepository.all();
  const listed = rows.filter((item) => item.status === "listed");
  const byType = listed.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  const averageYield =
    listed.length === 0
      ? 0
      : Number(
          (listed.reduce((sum, item) => sum + item.yieldPercent, 0) / listed.length).toFixed(2)
        );

  return {
    total: rows.length,
    listed: listed.length,
    featured: listed.filter((item) => item.featured).length,
    averageYield,
    byType,
  };
}

function create(body) {
  if (!body?.name || !body?.location) {
    throw AppError.validation("name and location are required");
  }
  return decorate(
    propertyRepository.create({
      ...body,
      slug: body.slug || slugify(body.name),
    })
  );
}

function update(id, body) {
  getById(id);
  const allowed = [
    "name",
    "location",
    "city",
    "country",
    "type",
    "status",
    "featured",
    "tokenSymbol",
    "occupancyPercent",
    "description",
    "image",
    "sqft",
    "beds",
    "baths",
    "yearBuilt",
    "yieldPercent",
    "amenities",
    "slug",
  ];
  const patch = {};
  for (const key of allowed) {
    if (body[key] !== undefined) patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0) {
    throw AppError.validation("No updatable fields provided");
  }
  return decorate(propertyRepository.update(id, patch));
}

module.exports = {
  list,
  getById,
  getBySlug,
  featured,
  filters,
  stats,
  create,
  update,
};
