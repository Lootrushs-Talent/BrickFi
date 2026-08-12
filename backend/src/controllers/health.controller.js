const env = require("../config/env");
const contractService = require("../services/contract.service");
const { getStatus } = require("../errors/init");
const { wrapAll } = require("./error");

async function getHealth(_req, res) {
  res.json({
    ok: true,
    service: "brickfi-backend",
    env: env.nodeEnv,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    errors: getStatus(),
  });
}

async function getReady(_req, res) {
  const info = contractService.getInfo();
  const rpc = await contractService.pingRpc();
  const ready = Boolean(info) && rpc.ok;

  res.status(ready ? 200 : 503).json({
    ok: ready,
    contract: Boolean(info),
    contractAddress: info?.address || null,
    rpc,
  });
}

module.exports = wrapAll({
  getHealth,
  getReady,
});
