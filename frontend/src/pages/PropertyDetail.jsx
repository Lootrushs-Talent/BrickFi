import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWallet } from "../context/WalletContext.jsx";
import {
  addToWatchlist,
  fetchProperty,
  fetchQuote,
  fetchShares,
  fetchWatchlist,
  recordActivity,
  removeFromWatchlist,
  toChainListing,
} from "../lib/api.js";
import { formatEth, formatNumber } from "../lib/format.js";

export default function PropertyDetail() {
  const { id } = useParams();
  const { account, connect, getContract, contractError, wrongNetwork } = useWallet();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [property, setProperty] = useState(null);
  const [onChain, setOnChain] = useState(null);
  const [myShares, setMyShares] = useState(0n);
  const [watched, setWatched] = useState(false);
  const [amount, setAmount] = useState("1");
  const [quote, setQuote] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadProperty() {
    const data = await fetchProperty(id);
    setProperty(data);
    setOnChain(toChainListing(data.onChain));
    return data;
  }

  async function loadWalletState(nextProperty, nextAccount = account) {
    if (!nextProperty || !nextAccount) {
      setMyShares(0n);
      setWatched(false);
      return;
    }
    try {
      const [shares, watchlist] = await Promise.all([
        fetchShares(nextProperty.id, nextAccount),
        fetchWatchlist(nextAccount),
      ]);
      setMyShares(BigInt(shares.shares));
      setWatched(watchlist.propertyIds.includes(nextProperty.id));
    } catch {
      try {
        const contract = await getContract(false);
        setMyShares(await contract.getShares(nextProperty.id, nextAccount));
      } catch {
        setMyShares(0n);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await loadProperty();
        if (!cancelled) await loadWalletState(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [account, id]);

  useEffect(() => {
    setAdded(false);
  }, [id]);

  useEffect(() => {
    if (!property) return undefined;
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const nextQuote = await fetchQuote(property.id, amount);
        if (!cancelled) setQuote(nextQuote);
      } catch {
        if (!cancelled) setQuote(null);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [amount, property]);

  const cost = useMemo(() => {
    if (quote?.cost) return BigInt(quote.cost);
    if (!onChain) return 0n;
    return BigInt(amount || "0") * onChain.sharePrice;
  }, [amount, onChain, quote]);

  const remaining = onChain ? Number(onChain.totalShares - onChain.sharesSold) : 0;
  const filled =
    onChain && onChain.totalShares
      ? Math.round((Number(onChain.sharesSold) / Number(onChain.totalShares)) * 100)
      : 0;

  async function onBuy(event) {
    event.preventDefault();
    setStatus("");
    setError("");
    try {
      if (!account) {
        connect();
        return;
      }
      const nextAccount = account;
      const shares = Number(amount);
      if (!Number.isInteger(shares) || shares <= 0) {
        throw new Error("Enter a whole number of shares.");
      }
      setBusy(true);
      const contract = await getContract(true);
      const tx = await contract.buyShares(property.id, shares, { value: cost });
      setStatus("Waiting for confirmation…");
      const receipt = await tx.wait();
      const signer = await contract.runner.getAddress?.();
      await recordActivity({
        address: signer || nextAccount,
        propertyId: property.id,
        type: "buy_confirmed",
        shares,
        txHash: receipt.hash,
      }).catch(() => {});
      setStatus(`Purchased ${shares} share${shares === 1 ? "" : "s"}.`);
      const data = await loadProperty();
      await loadWalletState(data, signer || nextAccount);
    } catch (err) {
      setError(parseBuyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onWatchlist() {
    try {
      if (!account) {
        connect();
        return;
      }
      if (watched) {
        await removeFromWatchlist(account, property.id);
        setWatched(false);
      } else {
        await addToWatchlist(account, property.id);
        setWatched(true);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !property) {
    return <p className="text-rose-300">{error}</p>;
  }
  if (!property) {
    return <p className="text-estate-200">Loading property…</p>;
  }

  return (
    <article>
      <Link to="/" className="mb-6 inline-block text-xs uppercase tracking-[0.22em] text-gold">
        ← Marketplace
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="relative overflow-hidden rounded-sm border border-white/10">
            <img src={property.image} alt={property.name} className="h-[420px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-estate-950 via-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="text-xs uppercase tracking-[0.22em] text-gold-light">{property.location}</p>
              <h1 className="font-serif text-5xl">{property.name}</h1>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-estate-200">{property.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Type" value={property.type} />
            <Stat label="Area" value={`${formatNumber(property.sqft)} sqft`} />
            <Stat label="Year" value={property.yearBuilt} />
            <Stat label="Yield" value={`${property.yieldPercent}%`} />
          </dl>
          {property.amenities?.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {property.amenities.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-estate-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit rounded-sm border border-white/10 bg-estate-900 p-6 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold">Invest</p>
              <h2 className="mt-2 font-serif text-3xl">Buy on-chain shares</h2>
            </div>
            <button
              type="button"
              onClick={onWatchlist}
              className="rounded-full border border-gold/30 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gold-light"
            >
              {watched ? "Saved" : "Save"}
            </button>
          </div>
          <p className="mt-2 text-sm text-estate-200">
            Add shares to your cart, then pay once at checkout. You can still buy this listing now.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <Row label="Share price" value={onChain ? formatEth(onChain.sharePrice) : "—"} />
            <Row label="Available" value={onChain ? formatNumber(remaining) : "—"} />
            <Row label="Your shares" value={formatNumber(Number(myShares))} />
            <Row label="Token" value={property.tokenSymbol} />
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gold" style={{ width: `${filled}%` }} />
          </div>
          <p className="mt-2 text-xs text-estate-200/70">{filled}% of the float sold</p>

          {contractError && <p className="mt-4 text-sm text-amber-200">{contractError}</p>}
          {wrongNetwork && (
            <p className="mt-4 text-sm text-amber-200">Switch Rainbow to Hardhat Local (31337).</p>
          )}

          <form className="mt-6 space-y-4" onSubmit={onBuy}>
            <label className="block text-sm">
              Shares
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-2 w-full rounded-sm border border-white/10 bg-estate-950 px-3 py-3 outline-none focus:border-gold/50"
              />
            </label>
            <p className="text-sm text-gold-light">Total {formatEth(cost)}</p>
            {quote && (
              <p className="text-xs text-estate-200/80">
                API quote: {quote.costEth} ETH
                {quote.canFill ? "" : " · not enough remaining shares"}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                try {
                  addItem({ ...property, onChain }, amount);
                  setAdded(true);
                  setStatus("");
                  setError("");
                } catch (err) {
                  setError(err.message);
                }
              }}
              disabled={!onChain || quote?.canFill === false}
              className="w-full rounded-sm border border-gold/40 py-3 text-sm font-medium text-gold-light hover:bg-gold/10 disabled:opacity-50"
            >
              {added ? "Added to cart" : "Add to cart"}
            </button>
            <button
              type="submit"
              disabled={busy || !onChain || quote?.canFill === false}
              className="w-full rounded-sm bg-gold py-3 text-sm font-medium text-estate-950 hover:bg-gold-light disabled:opacity-50"
            >
              {busy ? "Confirm in wallet…" : account ? "Buy now" : "Connect and buy now"}
            </button>
            {added && (
              <Link to="/cart" className="block text-center text-xs uppercase tracking-[0.18em] text-gold">
                View cart
              </Link>
            )}
          </form>
          {status && <p className="mt-4 text-sm text-emerald-300">{status}</p>}
          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </aside>
      </div>
    </article>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-sm border border-white/10 bg-estate-900 px-4 py-3">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-estate-200/70">{label}</dt>
      <dd className="mt-1 font-serif text-2xl">{value}</dd>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-estate-200/70">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function parseBuyError(error) {
  const message = error?.shortMessage || error?.reason || error?.message || "Transaction failed.";
  if (message.includes("user rejected")) return "Transaction rejected in the wallet.";
  return message;
}
