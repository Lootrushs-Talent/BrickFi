import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard.jsx";
import { fetchMarketListings, fetchMarketOverview, fetchPropertyFilters, toChainListing } from "../lib/api.js";

export default function Marketplace() {
  const [properties, setProperties] = useState([]);
  const [overview, setOverview] = useState(null);
  const [filters, setFilters] = useState({ types: [] });
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyFilters().then(setFilters).catch(() => {});
    fetchMarketOverview().then(setOverview).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const list = await fetchMarketListings({ q: query, type });
        if (!cancelled) {
          setProperties(list);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, type]);

  return (
    <section>
      <div className="mb-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.32em] text-gold">DeFi real estate</p>
          <h1 className="max-w-xl font-serif text-5xl leading-[0.95] sm:text-6xl">
            Own a fraction of the building, not a stack of paperwork.
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-estate-200">
          BrickFi is a skill-test demo: metadata lives on the API, ownership lives on a local
          Solidity vault. Connect with Rainbow, buy shares with test ETH, and track your
          holdings.
        </p>
      </div>

      {overview && (
        <dl className="mb-10 grid gap-3 sm:grid-cols-3">
          <Stat label="Listings" value={overview.listed} />
          <Stat label="Average yield" value={`${overview.averageYield}%`} />
          <Stat
            label="On-chain TVL"
            value={overview.chain?.available ? `${Number(overview.chain.tvlEth).toFixed(3)} ETH` : "Offline"}
          />
        </dl>
      )}

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search city, name, or copy"
          className="w-full rounded-sm border border-white/10 bg-estate-900 px-4 py-3 text-sm outline-none focus:border-gold/50"
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-sm border border-white/10 bg-estate-900 px-4 py-3 text-sm outline-none focus:border-gold/50 sm:w-52"
        >
          <option value="">All types</option>
          {filters.types.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="gold-line mb-10 h-px w-full" />
      {error && <p className="mb-6 text-sm text-rose-300">{error}</p>}
      {loading && <p className="text-sm text-estate-200">Loading listings…</p>}
      {!loading && properties.length === 0 && (
        <p className="text-sm text-estate-200">No listings match those filters.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} onChain={toChainListing(property.onChain)} />
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-sm border border-white/10 bg-estate-900 px-4 py-4">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-estate-200/70">{label}</dt>
      <dd className="mt-1 font-serif text-3xl">{value}</dd>
    </div>
  );
}
