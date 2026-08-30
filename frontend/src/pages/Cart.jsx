import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWallet } from "../context/WalletContext.jsx";
import { fetchCartQuote, recordActivity } from "../lib/api.js";
import { formatEth, formatNumber } from "../lib/format.js";

export default function Cart() {
  const { items, setShares, removeItem, clearCart } = useCart();
  const { account, connect, getContract, wrongNetwork } = useWallet();
  const [quote, setQuote] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setQuote(null);
      return undefined;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const next = await fetchCartQuote(
          items.map((item) => ({ propertyId: item.propertyId, shares: item.shares }))
        );
        if (!cancelled) {
          setQuote(next);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setQuote(null);
          setError(err.message);
        }
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [items]);

  async function onCheckout() {
    setStatus("");
    setError("");
    if (!account) {
      connect();
      return;
    }
    if (!quote?.canFill) {
      setError("One or more listings no longer have enough shares.");
      return;
    }
    setBusy(true);
    try {
      const contract = await getContract(true);
      const propertyIds = quote.items.map((item) => item.propertyId);
      const shareAmounts = quote.items.map((item) => item.shares);
      const value = BigInt(quote.totalCost);
      setStatus("Confirm the cart purchase in your wallet…");
      const tx = await contract.buyCart(propertyIds, shareAmounts, { value });
      const receipt = await tx.wait();
      await Promise.all(
        quote.items.map((item) =>
          recordActivity({
            address: account,
            propertyId: item.propertyId,
            type: "buy_confirmed",
            shares: item.shares,
            txHash: receipt.hash,
            note: "cart checkout",
          }).catch(() => {})
        )
      );
      clearCart();
      setStatus(`Purchased ${shareAmounts.reduce((sum, n) => sum + n, 0)} shares.`);
    } catch (err) {
      const message = err?.shortMessage || err?.reason || err?.message || "Checkout failed.";
      setError(message.includes("user rejected") ? "Transaction rejected in the wallet." : message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <p className="mb-3 text-xs uppercase tracking-[0.32em] text-gold">Checkout</p>
      <h1 className="font-serif text-5xl">Cart</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-estate-200">
        Add shares from any listing, then pay once. The marketplace contract settles the whole cart
        in a single transaction.
      </p>

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-estate-200">
          Your cart is empty.{" "}
          <Link className="text-gold" to="/">
            Browse the marketplace
          </Link>
          {status ? ` · ${status}` : ""}
        </p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <ul className="space-y-4">
            {items.map((item) => {
              const line = quote?.items.find((row) => row.propertyId === item.propertyId);
              return (
                <li
                  key={item.propertyId}
                  className="flex gap-4 rounded-sm border border-white/10 bg-estate-900 p-4"
                >
                  <Link to={`/property/${item.propertyId}`} className="h-24 w-28 shrink-0 overflow-hidden">
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/property/${item.propertyId}`} className="font-serif text-2xl hover:text-gold-light">
                      {item.name}
                    </Link>
                    <p className="text-xs uppercase tracking-[0.16em] text-estate-200/70">{item.location}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="text-sm">
                        Shares
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.shares}
                          onChange={(event) => setShares(item.propertyId, event.target.value)}
                          className="ml-2 w-20 rounded-sm border border-white/10 bg-estate-950 px-2 py-1"
                        />
                      </label>
                      <span className="text-sm text-gold-light">
                        {line ? formatEth(line.cost) : "…"}
                      </span>
                      {line && !line.canFill && (
                        <span className="text-xs text-rose-300">Not enough remaining</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.propertyId)}
                    className="self-start text-xs uppercase tracking-[0.16em] text-estate-200 hover:text-white"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-sm border border-white/10 bg-estate-900 p-6">
            <h2 className="font-serif text-3xl">Order</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Listings" value={formatNumber(items.length)} />
              <Row label="Shares" value={formatNumber(items.reduce((sum, item) => sum + item.shares, 0))} />
              <Row label="Total" value={quote ? formatEth(quote.totalCost) : "…"} />
              <Row
                label="Modeled yield"
                value={quote ? `${quote.modeledAnnualReturnEth} ETH / yr` : "…"}
              />
            </div>
            {wrongNetwork && (
              <p className="mt-4 text-sm text-amber-200">Switch Rainbow to Hardhat Local (31337).</p>
            )}
            <button
              type="button"
              onClick={onCheckout}
              disabled={busy || !quote || quote.canFill === false}
              className="mt-6 w-full rounded-sm bg-gold py-3 text-sm font-medium text-estate-950 hover:bg-gold-light disabled:opacity-50"
            >
              {busy ? "Confirm in wallet…" : account ? "Buy cart" : "Connect and buy"}
            </button>
            {status && <p className="mt-4 text-sm text-emerald-300">{status}</p>}
            {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
          </aside>
        </div>
      )}
    </section>
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
