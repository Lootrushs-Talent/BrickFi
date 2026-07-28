const { wrapAll } = require("./error");

const catalog = [
  { method: "GET", path: "/api", purpose: "Endpoint catalog" },
  { method: "GET", path: "/api/health", purpose: "Liveness" },
  { method: "GET", path: "/api/health/ready", purpose: "RPC + contract readiness" },
  { method: "GET", path: "/api/contract", purpose: "Address + ABI" },
  { method: "GET", path: "/api/contract/status", purpose: "Deploy and RPC status" },
  { method: "GET", path: "/api/contract/network", purpose: "Chain / RPC details" },
  { method: "GET", path: "/api/properties", purpose: "Filterable off-chain listings" },
  { method: "GET", path: "/api/properties/featured", purpose: "Featured listings" },
  { method: "GET", path: "/api/properties/stats", purpose: "Off-chain listing aggregates" },
  { method: "GET", path: "/api/properties/filters", purpose: "Type / city / country facets" },
  { method: "GET", path: "/api/properties/slug/:slug", purpose: "Listing by slug" },
  { method: "GET", path: "/api/properties/:id", purpose: "Listing + live chain data" },
  { method: "GET", path: "/api/properties/:id/chain", purpose: "On-chain float only" },
  { method: "GET", path: "/api/properties/:id/quote?shares=", purpose: "Share purchase quote" },
  { method: "GET", path: "/api/properties/:id/shares/:address", purpose: "Investor share balance" },
  { method: "POST", path: "/api/properties", purpose: "Create off-chain listing" },
  { method: "PATCH", path: "/api/properties/:id", purpose: "Update listing metadata" },
  { method: "GET", path: "/api/market/overview", purpose: "Marketplace + TVL snapshot" },
  { method: "GET", path: "/api/market/listings", purpose: "Merged metadata + chain state" },
  { method: "GET", path: "/api/investors/:address", purpose: "Investor profile" },
  { method: "GET", path: "/api/investors/:address/portfolio", purpose: "On-chain holdings" },
  { method: "GET", path: "/api/watchlist/:address", purpose: "Saved listings" },
  { method: "POST", path: "/api/watchlist", purpose: "Save a listing" },
  { method: "DELETE", path: "/api/watchlist", purpose: "Remove a saved listing" },
  { method: "POST", path: "/api/cart/quote", purpose: "Quote a multi-listing share cart" },
  { method: "GET", path: "/api/activity", purpose: "Recent off-chain activity" },
  { method: "GET", path: "/api/activity/:address", purpose: "Activity for a wallet" },
  { method: "POST", path: "/api/activity", purpose: "Record a quote, intent, or confirmed buy" },
];

async function getCatalog(_req, res) {
  res.json({
    service: "brickfi-backend",
    endpoints: catalog,
  });
}

module.exports = wrapAll({ getCatalog }).getCatalog;
