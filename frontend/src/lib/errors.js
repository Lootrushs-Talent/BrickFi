export class ApiError extends Error {
  constructor(message, { status = 0, code = "API_ERROR" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const CUSTOM_ERRORS = {
  SoldOut: "Not enough shares remaining on this listing.",
  IncorrectPayment: "ETH amount does not match the quoted share price.",
  NotListed: "This listing is not live on-chain.",
  InvalidParams: "Share amount is invalid.",
  NotAdmin: "Only the contract admin can do that.",
  NotSeller: "Only the listing seller can withdraw proceeds.",
  NothingToWithdraw: "There are no proceeds to withdraw.",
  Reentrant: "Transaction was blocked by the reentrancy guard.",
};

export async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 12000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(path, {
      ...options,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError(data.error || `Request failed (${res.status})`, {
        status: res.status,
      });
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === "AbortError") {
      throw new ApiError("The API did not respond in time. Confirm it is serving port 4000.", {
        code: "TIMEOUT",
      });
    }
    throw new ApiError("Cannot reach the API on port 4000. Start that service, then refresh.", {
      code: "NETWORK",
    });
  } finally {
    clearTimeout(timer);
  }
}

export function parseChainError(error) {
  const name = error?.errorName || error?.revert?.name;
  if (name && CUSTOM_ERRORS[name]) return CUSTOM_ERRORS[name];

  const message = String(
    error?.shortMessage || error?.reason || error?.error?.message || error?.message || ""
  );

  if (/user rejected|User rejected|ACTION_REJECTED|code 4001/i.test(message)) {
    return "Transaction rejected in the wallet.";
  }
  if (/buyCart|unknown function|does not exist|missing revert data/i.test(message)) {
    return "This contract build is missing buyCart. Redeploy RealEstateMarketplace to localhost.";
  }
  if (/network|chain/i.test(message) && /31337|Hardhat|unsupported/i.test(message)) {
    return "Switch the wallet to Hardhat Local (chain 31337).";
  }
  for (const [key, label] of Object.entries(CUSTOM_ERRORS)) {
    if (message.includes(key)) return label;
  }
  return message || "Transaction failed.";
}
