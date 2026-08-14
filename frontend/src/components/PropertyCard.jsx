import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatEth, formatNumber } from "../lib/format.js";

export default function PropertyCard({ property, onChain }) {
  const { addItem } = useCart();
  const sold = Number(onChain?.sharesSold ?? 0);
  const total = Number(onChain?.totalShares ?? 0);
  const filled = total ? Math.min(100, Math.round((sold / total) * 100)) : 0;

  function onAdd(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!onChain) return;
    addItem({ ...property, onChain }, 1);
  }

  return (
    <article className="group overflow-hidden rounded-sm border border-white/10 bg-estate-900 shadow-card transition hover:-translate-y-1 hover:border-gold/40">
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative h-52 overflow-hidden">
          <img
            src={property.image}
            alt={property.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-estate-950 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold-light backdrop-blur">
            {property.type}
          </span>
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <Link to={`/property/${property.id}`}>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/80">{property.location}</p>
          <h3 className="font-serif text-3xl leading-tight">{property.name}</h3>
        </Link>
        <div className="flex items-end justify-between gap-4 text-sm">
          <div>
            <p className="text-estate-200/70">Share price</p>
            <p className="text-gold-light">{onChain ? formatEth(onChain.sharePrice) : "…"}</p>
          </div>
          <div className="text-right">
            <p className="text-estate-200/70">Modeled yield</p>
            <p>{property.yieldPercent}%</p>
          </div>
        </div>
        <div>
          <div className="mb-2 flex justify-between text-xs text-estate-200/70">
            <span>{filled}% funded</span>
            <span>
              {formatNumber(sold)} / {formatNumber(total)} shares
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gold" style={{ width: `${filled}%` }} />
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={!onChain}
          className="w-full rounded-sm border border-gold/40 py-2 text-xs uppercase tracking-[0.18em] text-gold-light hover:bg-gold/10 disabled:opacity-40"
        >
          Add 1 share
        </button>
      </div>
    </article>
  );
}
