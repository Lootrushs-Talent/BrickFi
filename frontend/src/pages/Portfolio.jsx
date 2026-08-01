import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext.jsx";
import { fetchInvestorPortfolio } from "../lib/api.js";
import { formatEth, formatNumber } from "../lib/format.js";

export default function Portfolio() {
  const { account } = useWallet();
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account) {
      setPortfolio(null);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchInvestorPortfolio(account);
        if (!cancelled) setPortfolio(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [account]);

  const rows = portfolio?.holdings || [];
  const saved = portfolio?.watchlist || [];

  return (
    <section>
      <p className="mb-3 text-xs uppercase tracking-[0.32em] text-gold">Wallet holdings</p>
      <h1 className="font-serif text-5xl">Portfolio</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-estate-200">
        The backend reads share balances from the marketplace contract and joins them with listing
        metadata. Confirmed buys are also stored as activity records.
      </p>

      {!account && (
        <div className="mt-8">
          <ConnectButton label="Connect wallet to view holdings" />
        </div>
      )}

      {account && loading && <p className="mt-8 text-sm text-estate-200">Reading holdings…</p>}
      {error && <p className="mt-8 text-sm text-rose-300">{error}</p>}

      {account && !loading && rows.length === 0 && !error && (
        <p className="mt-8 text-sm text-estate-200">
          No shares yet.{" "}
          <Link className="text-gold" to="/">
            Browse the marketplace
          </Link>
          .
        </p>
      )}

      {rows.length > 0 && (
        <>
          <p className="mt-8 text-sm text-gold-light">
            Total invested {formatEth(portfolio.totals.invested)} · modeled yield{" "}
            {portfolio.totals.modeledAnnualReturnEth} ETH / yr
          </p>
          <div className="mt-6 overflow-hidden rounded-sm border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-estate-900 text-xs uppercase tracking-[0.16em] text-estate-200/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Shares</th>
                  <th className="px-4 py-3 font-medium">Share price</th>
                  <th className="px-4 py-3 font-medium">Invested</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.property.id} className="border-t border-white/5">
                    <td className="px-4 py-4">
                      <Link to={`/property/${row.property.id}`} className="hover:text-gold-light">
                        <span className="block font-medium">{row.property.name}</span>
                        <span className="text-xs text-estate-200/70">{row.property.location}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-4">{formatNumber(Number(row.shares))}</td>
                    <td className="px-4 py-4">{formatEth(row.sharePrice)}</td>
                    <td className="px-4 py-4">{formatEth(row.invested)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {saved.length > 0 && (
        <p className="mt-8 text-sm text-estate-200">
          Watchlist:{" "}
          {saved.map((propertyId, index) => (
            <span key={propertyId}>
              {index > 0 ? ", " : ""}
              <Link className="text-gold" to={`/property/${propertyId}`}>
                #{propertyId}
              </Link>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
