const path = require("path");

const CONTRACTS_ROOT = path.join(__dirname, "..", "..", "..", "contracts");

module.exports = {
  contractsRoot: CONTRACTS_ROOT,
  deploymentPath: path.join(CONTRACTS_ROOT, "deployments", "localhost.json"),
  artifactPath: path.join(
    CONTRACTS_ROOT,
    "artifacts",
    "contracts",
    "RealEstateMarketplace.sol",
    "RealEstateMarketplace.json"
  ),
  runtimeDir: path.join(__dirname, "..", "..", "data", "runtime"),
};
