import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi";
import { fetchContract } from "../lib/api.js";
import { hardhatLocal } from "../lib/wagmi.js";

const WalletContext = createContext(null);

function walletClientToSigner(walletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}

export function WalletProvider({ children }) {
  const { address, isConnecting } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const [contractInfo, setContractInfo] = useState(null);
  const [contractError, setContractError] = useState("");

  const loadContract = useCallback(async () => {
    try {
      const info = await fetchContract();
      setContractInfo(info);
      setContractError("");
    } catch (error) {
      setContractInfo(null);
      setContractError(error.message);
    }
  }, []);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  const connect = useCallback(() => {
    if (!openConnectModal) {
      throw new Error("Wallet modal is not ready yet.");
    }
    openConnectModal();
  }, [openConnectModal]);

  const switchToHardhat = useCallback(async () => {
    await switchChainAsync({ chainId: hardhatLocal.id });
  }, [switchChainAsync]);

  const disconnect = useCallback(() => {}, []);

  const getContract = useCallback(
    async (withSigner = false) => {
      if (!contractInfo?.address || !contractInfo?.abi) {
        throw new Error(contractError || "Contract is not available.");
      }
      if (withSigner) {
        if (!walletClient) {
          throw new Error("Connect a wallet with Rainbow to continue.");
        }
        return new Contract(
          contractInfo.address,
          contractInfo.abi,
          walletClientToSigner(walletClient)
        );
      }
      const provider = new BrowserProvider(walletClient?.transport || window.ethereum);
      return new Contract(contractInfo.address, contractInfo.abi, provider);
    },
    [contractError, contractInfo, walletClient]
  );

  const value = useMemo(
    () => ({
      account: address || "",
      chainId,
      connecting: isConnecting,
      contractInfo,
      contractError,
      connectError: "",
      wrongNetwork: Boolean(address) && chainId !== hardhatLocal.id,
      connect,
      switchToHardhat,
      disconnect,
      getContract,
      refreshContract: loadContract,
    }),
    [
      address,
      chainId,
      isConnecting,
      contractInfo,
      contractError,
      connect,
      switchToHardhat,
      disconnect,
      getContract,
      loadContract,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return context;
}
