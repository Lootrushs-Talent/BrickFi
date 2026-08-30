import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig, hardhatLocal } from "./lib/wagmi.js";

const queryClient = new QueryClient();

const theme = darkTheme({
  accentColor: "#c4a574",
  accentColorForeground: "#0b100e",
  borderRadius: "small",
  fontStack: "system",
  overlayBlur: "small",
});

export default function Web3Providers({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme} initialChain={hardhatLocal} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
