const path = require("path");

try {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
} catch {
  // dotenv is optional; process.env still works.
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  chainId: Number(process.env.CHAIN_ID) || 31337,
};

module.exports = env;
