const { formatEther } = require("ethers");
const { normalizeAddress } = require("../utils/eth");
const contractService = require("./contract.service");
const propertyService = require("./property.service");
const watchlistRepository = require("../repositories/watchlist.repository");
const activityRepository = require("../repositories/activity.repository");

async function getPortfolio(address) {
  const checksum = normalizeAddress(address);
  const properties = propertyService.list();
  const holdings = [];

  for (const property of properties) {
    let shares = "0";
    let onChain = null;
    try {
      shares = await contractService.getShares(property.id, checksum);
      onChain = await contractService.getOnChainProperty(property.id);
    } catch {
      continue;
    }
    if (shares === "0") continue;

    const invested = BigInt(shares) * BigInt(onChain.sharePrice);
    holdings.push({
      property,
      shares,
      sharePrice: onChain.sharePrice,
      sharePriceEth: onChain.sharePriceEth,
      invested: invested.toString(),
      investedEth: formatEther(invested),
      modeledAnnualReturnEth: Number(
        (Number(formatEther(invested)) * (property.yieldPercent / 100)).toFixed(6)
      ),
    });
  }

  const totalInvested = holdings.reduce((sum, row) => sum + BigInt(row.invested), 0n);

  return {
    address: checksum,
    holdings,
    totals: {
      properties: holdings.length,
      invested: totalInvested.toString(),
      investedEth: formatEther(totalInvested),
      modeledAnnualReturnEth: Number(
        holdings.reduce((sum, row) => sum + row.modeledAnnualReturnEth, 0).toFixed(6)
      ),
    },
    watchlist: watchlistRepository.list(checksum),
    recentActivity: activityRepository.list({ address: checksum, limit: 10 }),
  };
}

function getProfile(address) {
  const checksum = normalizeAddress(address);
  return {
    address: checksum,
    watchlistIds: watchlistRepository.list(checksum),
    activityCount: activityRepository.list({ address: checksum, limit: 1000 }).length,
  };
}

module.exports = {
  getPortfolio,
  getProfile,
};
