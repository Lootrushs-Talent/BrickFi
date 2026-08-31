import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWallet } from "../context/WalletContext.jsx";

export default function Navbar() {
  const { contractError, wrongNetwork, switchToHardhat } = useWallet();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-estate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-sm border border-gold/40 text-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 20V10L12 4l8 6v10H4Z" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
          <span>
            <span className="block font-serif text-2xl leading-none tracking-wide">BrickFi</span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold/80">Tokenized holdings</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-estate-200 sm:gap-8">
          <NavLink className={navClass} to="/">
            Marketplace
          </NavLink>
          <NavLink className={navClass} to="/portfolio">
            Portfolio
          </NavLink>
          <NavLink className={(props) => `${navClass(props)} inline-flex items-center`} to="/cart">
            Cart
            {count > 0 && (
              <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium text-estate-950">
                {count}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {wrongNetwork && (
            <button
              type="button"
              onClick={() => switchToHardhat().catch((error) => window.alert(error.message))}
              className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200"
            >
              Switch to Hardhat
            </button>
          )}
          {contractError && (
            <span className="hidden max-w-[180px] truncate text-xs text-rose-300 lg:inline" title={contractError}>
              Contract offline
            </span>
          )}
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
        </div>
      </div>
    </header>
  );
}

function navClass({ isActive }) {
  return isActive ? "text-gold-light" : "hover:text-white";
}
