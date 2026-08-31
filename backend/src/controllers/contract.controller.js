const contractService = require("../services/contract.service");
const { AppError, wrapAll } = require("./error");

async function getContract(_req, res) {
  res.json(contractService.requireInfo());
}

async function getStatus(_req, res) {
  const info = contractService.getInfo();
  const rpc = await contractService.pingRpc();
  let propertyCount = null;
  if (info && rpc.ok) {
    try {
      propertyCount = await contractService.getPropertyCount();
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
    }
  }

  res.json({
    deployed: Boolean(info),
    address: info?.address || null,
    chainId: info?.chainId || null,
    network: info?.network || null,
    deployer: info?.deployer || null,
    rpc,
    propertyCount,
  });
}

async function getNetwork(_req, res) {
  const info = contractService.requireInfo();
  const rpc = await contractService.pingRpc();
  res.json({
    chainId: info.chainId,
    network: info.network,
    rpcUrl: info.rpcUrl,
    address: info.address,
    rpc,
  });
}

module.exports = wrapAll({
  getContract,
  getStatus,
  getNetwork,
});
