export default function ErrorBanner({ message, onRetry, tone = "error" }) {
  if (!message) return null;
  const colors =
    tone === "warn"
      ? "border-amber-400/20 bg-amber-400/5 text-amber-100"
      : "border-rose-400/20 bg-rose-400/5 text-rose-200";

  return (
    <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border px-4 py-3 text-sm ${colors}`}>
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.16em]"
        >
          Retry
        </button>
      )}
    </div>
  );
}
