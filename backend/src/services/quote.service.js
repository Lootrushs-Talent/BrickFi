const { formatEther } = require("ethers");
const contractService = require("./contract.service");
const propertyService = require("./property.service");
const { AppError } = require("./error");

function parseShares(value) {
  const shares = Number(value);
  if (!Number.isInteger(shares) || shares <= 0) {
    throw AppError.validation("shares must be a positive whole number");
  }
  return shares;
}

async function quote(propertyId, shareAmount) {
  const property = propertyService.getById(propertyId);
  const shares = parseShares(shareAmount);
  const onChain = await contractService.getOnChainProperty(property.id);

  if (!onChain) {
    throw AppError.conflict("This listing is not live on-chain yet");
  }

  const remaining = Number(onChain.remaining);
  const cost = BigInt(onChain.sharePrice) * BigInt(shares);
  const canFill = shares <= remaining;
  const modeledAnnualReturnEth =
    Number(formatEther(cost)) * (property.yieldPercent / 100);

  return {
    propertyId: property.id,
    name: property.name,
    shares,
    sharePrice: onChain.sharePrice,
    sharePriceEth: onChain.sharePriceEth,
    cost: cost.toString(),
    costEth: formatEther(cost),
    remaining,
    canFill,
    yieldPercent: property.yieldPercent,
    modeledAnnualReturnEth: Number(modeledAnnualReturnEth.toFixed(6)),
    message: canFill
      ? "Quote is valid if the on-chain float has not changed."
      : "Not enough shares remaining at the current on-chain float.",
  };
}

async function quoteCart(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw AppError.validation("Cart items are required");
  }

  const lines = [];
  for (const item of items) {
    const line = await quote(item.propertyId, item.shares);
    lines.push({
      ...line,
      image: propertyService.getById(item.propertyId).image,
      location: propertyService.getById(item.propertyId).location,
      tokenSymbol: propertyService.getById(item.propertyId).tokenSymbol,
    });
  }

  const totalCost = lines.reduce((sum, line) => sum + BigInt(line.cost), 0n);
  return {
    items: lines,
    canFill: lines.every((line) => line.canFill),
    totalCost: totalCost.toString(),
    totalCostEth: formatEther(totalCost),
    modeledAnnualReturnEth: Number(
      lines.reduce((sum, line) => sum + line.modeledAnnualReturnEth, 0).toFixed(6)
    ),
  };
}

module.exports = {
  quote,
  quoteCart,
  parseShares,
};
