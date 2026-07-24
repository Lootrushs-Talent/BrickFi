const API = "/api";

async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function queryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

export function fetchProperties(params) {
  return fetch(`${API}/properties${queryString(params)}`).then(readJson);
}

export function fetchProperty(id) {
  return fetch(`${API}/properties/${id}`).then(readJson);
}

export function fetchContract() {
  return fetch(`${API}/contract`).then(readJson);
}

export function fetchPropertyFilters() {
  return fetch(`${API}/properties/filters`).then(readJson);
}

export function fetchMarketOverview() {
  return fetch(`${API}/market/overview`).then(readJson);
}

export function fetchMarketListings(params) {
  return fetch(`${API}/market/listings${queryString(params)}`).then(readJson);
}

export function fetchQuote(propertyId, shares) {
  return fetch(`${API}/properties/${propertyId}/quote${queryString({ shares })}`).then(readJson);
}

export function fetchShares(propertyId, address) {
  return fetch(`${API}/properties/${propertyId}/shares/${address}`).then(readJson);
}

export function fetchInvestorPortfolio(address) {
  return fetch(`${API}/investors/${address}/portfolio`).then(readJson);
}

export function fetchWatchlist(address) {
  return fetch(`${API}/watchlist/${address}`).then(readJson);
}

export function addToWatchlist(address, propertyId) {
  return fetch(`${API}/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, propertyId }),
  }).then(readJson);
}

export function removeFromWatchlist(address, propertyId) {
  return fetch(`${API}/watchlist`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, propertyId }),
  }).then(readJson);
}

export function recordActivity(payload) {
  return fetch(`${API}/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(readJson);
}

export function fetchCartQuote(items) {
  return fetch(`${API}/cart/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).then(readJson);
}

export function toChainListing(onChain) {
  if (!onChain) return null;
  return {
    ...onChain,
    sharePrice: BigInt(onChain.sharePrice),
    totalShares: BigInt(onChain.totalShares),
    sharesSold: BigInt(onChain.sharesSold),
    proceeds: BigInt(onChain.proceeds || 0),
  };
}
