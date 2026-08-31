const { formatEther } = require("ethers");
const contractService = require("./contract.service");
const propertyService = require("./property.service");

function emptyChainOverview() {
  return {
    available: false,
    listedOnChain: 0,
    totalShares: "0",
    sharesSold: "0",
    tvlWei: "0",
    tvlEth: "0",
  };
}

async function safeChainListings() {
  try {
    return await contractService.listOnChainProperties();
  } catch {
    return null;
  }
}

async function getListings(query) {
  const properties = propertyService.list(query);
  const chainRows = await safeChainListings();
  const chainMap = new Map((chainRows || []).map((row) => [row.id, row]));

  return properties.map((property) => ({
    ...property,
    onChain: chainMap.get(property.id) || null,
  }));
}

async function getOverview() {
  const offChain = propertyService.stats();
  const chainRows = await safeChainListings();
  if (!chainRows) {
    return { ...offChain, chain: emptyChainOverview() };
  }

  const totals = chainRows.reduce(
    (acc, row) => {
      acc.totalShares += BigInt(row.totalShares);
      acc.sharesSold += BigInt(row.sharesSold);
      acc.tvlWei += BigInt(row.sharePrice) * BigInt(row.sharesSold);
      return acc;
    },
    { totalShares: 0n, sharesSold: 0n, tvlWei: 0n }
  );

  return {
    ...offChain,
    chain: {
      available: true,
      listedOnChain: chainRows.length,
      totalShares: totals.totalShares.toString(),
      sharesSold: totals.sharesSold.toString(),
      tvlWei: totals.tvlWei.toString(),
      tvlEth: formatEther(totals.tvlWei),
    },
  };
}

module.exports = {
  getListings,
  getOverview,
};
