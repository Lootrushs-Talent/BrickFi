import Navbar from "./Navbar.jsx";

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen">
      <div className="grain" />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-5 pb-20 pt-10">{children}</main>
      <footer className="relative border-t border-white/5 py-8 text-center text-xs uppercase tracking-[0.22em] text-estate-200/70">
        BrickFi demo · local Hardhat · not legal title
      </footer>
    </div>
  );
}
