import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { WalletProvider } from "./context/WalletContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import Web3Providers from "./providers.jsx";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Web3Providers>
      <BrowserRouter>
        <WalletProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </WalletProvider>
      </BrowserRouter>
    </Web3Providers>
  </React.StrictMode>
);
