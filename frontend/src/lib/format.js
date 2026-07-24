import { formatEther } from "ethers";

export function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatEth(value) {
  if (value == null) return "—";
  const asString = formatEther(value);
  const num = Number(asString);
  if (!Number.isFinite(num)) return `${asString} ETH`;
  return `${num.toFixed(num >= 0.01 ? 3 : 4)} ETH`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}
