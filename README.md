# BrickFi

Skill-test demo of **tokenized real estate**: a React marketplace, an Express API for property metadata, and a Solidity vault that sells fractional shares for ETH.

```text
Frontend (Vite + React)  →  wallet + buy shares
Backend  (Express)       →  listings, ABI, contract address
Contract (Hardhat)       →  list properties, buy shares, withdraw proceeds
```

## What you can do

1. Browse six off-chain property listings (photos, yield copy, size).
2. Connect MetaMask to the local Hardhat chain.
3. Buy an exact number of shares; ownership is stored on-chain.
4. Add listings to the **Cart** and check out in one `buyCart` transaction.
5. Open **Portfolio** to read those shares back from the contract.

The backend never moves money. It only serves metadata and the compiled ABI. Settlement happens in `RealEstateMarketplace`.

## Project layout

| Folder | Role |
| --- | --- |
| `contracts/` | Solidity vault, tests, deploy + seed script |
| `backend/` | Express API: routes, controllers, services, repositories |
| `frontend/` | Marketplace UI on port `5173` |

## Run locally

Use three terminals. Node.js 18+ is required. MetaMask is required for wallet actions.

**1. Blockchain**

```bash
cd contracts
npm install
npx hardhat node
```

Leave that process running.

**2. Deploy and seed listings**

```bash
cd contracts
npx hardhat test
npx hardhat run scripts/deploy.js --network localhost
```

This writes `contracts/deployments/localhost.json` and lists the six demo properties.

**3. API**

```bash
cd backend
npm install
npm run dev
```

**4. App**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Wallet (RainbowKit)

The app uses [RainbowKit](https://rainbowkit.com) to connect. Rainbow, MetaMask, and other injected wallets appear in the modal.

1. Create / import a **test** wallet. Do not use a funded mainnet seed.
2. Import Hardhat account #0 (deployer) or #1 (investor):

```text
Account #0
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private key:
ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

3. Click **Connect Wallet**. Choose Rainbow (or MetaMask), then switch to **Hardhat Local** (`chainId 31337`, RPC `http://127.0.0.1:8545`).
4. Buy shares from a property page and confirm in the wallet.

Hardhat accounts start with 10,000 test ETH. Share prices are a fraction of 1 ETH so a few clicks are enough.

For Rainbow mobile via WalletConnect, set `VITE_WALLETCONNECT_PROJECT_ID` in `frontend/.env` from [WalletConnect Cloud](https://cloud.walletconnect.com). Local Hardhat is easiest with the Rainbow or MetaMask browser extension.

## API

The backend is split into `routes` → `controllers` → `services` → `repositories`. Listing copy is off-chain; share balances and quotes are read from Hardhat. Settlement still happens in the wallet.

`GET /api` returns the full catalog. The important routes:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness |
| `GET` | `/api/health/ready` | RPC + contract readiness |
| `GET` | `/api/contract` | Address + ABI after deploy |
| `GET` | `/api/contract/status` | Deploy + node status |
| `GET` | `/api/properties` | Filterable listings (`q`, `type`, `minYield`, `sort`) |
| `GET` | `/api/properties/:id` | Listing joined with live chain data |
| `GET` | `/api/properties/:id/quote?shares=` | Exact ETH cost before buying |
| `POST` / `PATCH` | `/api/properties` | Create or update off-chain metadata |
| `GET` | `/api/market/overview` | Counts, average yield, on-chain TVL |
| `GET` | `/api/market/listings` | Metadata + remaining shares |
| `POST` | `/api/cart/quote` | Quote a multi-listing share cart |
| `GET` | `/api/investors/:address/portfolio` | Holdings for a wallet |
| `GET` / `POST` / `DELETE` | `/api/watchlist` | Saved listings |
| `GET` / `POST` | `/api/activity` | Quote / buy records |

The Vite dev server proxies `/api` to `http://localhost:4000`.

## Contract notes

- `listProperty` is admin-only; the deploy script is that admin.
- `buyShares` requires **exact** `shareAmount * sharePrice` in `msg.value`.
- `buyCart` buys several listings in one payment; `msg.value` must equal the sum.
- Sale proceeds stay in the contract until the seller calls `withdrawProceeds` (pull payment, plus a simple reentrancy guard).

This is a local demo, not a production protocol: no audits, no real title, no mainnet deploy.
