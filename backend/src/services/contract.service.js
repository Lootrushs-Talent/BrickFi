const fs = require("fs");
const { Contract, JsonRpcProvider, formatEther } = require("ethers");
const env = require("../config/env");
const { artifactPath, deploymentPath } = require("../config/paths");
const { AppError } = require("./error");

let cache = {
  expiresAt: 0,
  deployment: null,
  abi: null,
};

const CACHE_MS = 5_000;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadFiles() {
  if (!fs.existsSync(deploymentPath) || !fs.existsSync(artifactPath)) {
    return null;
  }
  const now = Date.now();
  if (cache.deployment && cache.expiresAt > now) {
    return cache;
  }
  const deployment = readJson(deploymentPath);
  const artifact = readJson(artifactPath);
  cache = {
    expiresAt: now + CACHE_MS,
    deployment,
    abi: artifact.abi,
  };
  return cache;
}

function getInfo() {
  const files = loadFiles();
  if (!files) return null;
  return {
    address: files.deployment.address,
    chainId: files.deployment.chainId || env.chainId,
    network: files.deployment.network || "localhost",
    deployer: files.deployment.deployer,
    rpcUrl: env.rpcUrl,
    abi: files.abi,
  };
}

function requireInfo() {
  const info = getInfo();
  if (!info) {
    throw AppError.unavailable(
      "Contract is not deployed yet. Start Hardhat and run the deploy script."
    );
  }
  return info;
}

function getProvider() {
  return new JsonRpcProvider(env.rpcUrl, undefined, { staticNetwork: true });
}

function getReadonlyContract() {
  const info = requireInfo();
  return {
    info,
    contract: new Contract(info.address, info.abi, getProvider()),
  };
}

function serializeListing(property) {
  if (!property || !property.listed) return null;
  const totalShares = BigInt(property.totalShares);
  const sharesSold = BigInt(property.sharesSold);
  const sharePrice = BigInt(property.sharePrice);
  return {
    id: Number(property.id),
    seller: property.seller,
    name: property.name,
    location: property.location,
    totalShares: totalShares.toString(),
    sharePrice: sharePrice.toString(),
    sharePriceEth: formatEther(sharePrice),
    sharesSold: sharesSold.toString(),
    remaining: (totalShares - sharesSold).toString(),
    proceeds: BigInt(property.proceeds).toString(),
    listed: Boolean(property.listed),
    fundedPercent: totalShares === 0n ? 0 : Number((sharesSold * 100n) / totalShares),
  };
}

async function pingRpc() {
  try {
    const block = await getProvider().getBlockNumber();
    return { ok: true, blockNumber: block };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function getOnChainProperty(id) {
  try {
    const { contract } = getReadonlyContract();
    const listing = await contract.getProperty(id);
    return serializeListing(listing);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.unavailable("Could not read the listing from the chain", {
      cause: error.message,
    });
  }
}

async function getShares(propertyId, address) {
  try {
    const { contract } = getReadonlyContract();
    const shares = await contract.getShares(propertyId, address);
    return shares.toString();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.unavailable("Could not read share balance from the chain", {
      cause: error.message,
    });
  }
}

async function getPropertyCount() {
  try {
    const { contract } = getReadonlyContract();
    const count = await contract.propertyCount();
    return Number(count);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.unavailable("Could not read property count from the chain", {
      cause: error.message,
    });
  }
}

async function listOnChainProperties() {
  try {
    const { contract } = getReadonlyContract();
    const count = Number(await contract.propertyCount());
    const listings = [];
    for (let id = 1; id <= count; id += 1) {
      listings.push(serializeListing(await contract.getProperty(id)));
    }
    return listings.filter(Boolean);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.unavailable("Could not list on-chain properties", {
      cause: error.message,
    });
  }
}

module.exports = {
  getInfo,
  requireInfo,
  pingRpc,
  getOnChainProperty,
  getShares,
  getPropertyCount,
  listOnChainProperties,
};
