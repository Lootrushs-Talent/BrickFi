import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet, metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { defineChain } from "viem";

export const hardhatLocal = defineChain({
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "BrickFi",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000",
  chains: [hardhatLocal],
  transports: {
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
  wallets: [
    {
      groupName: "Suggested",
      wallets: [rainbowWallet, metaMaskWallet, injectedWallet],
    },
  ],
  ssr: false,
});
