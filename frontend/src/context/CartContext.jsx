import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "brickfi-cart";
const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((property, shares = 1) => {
    const nextShares = Number(shares);
    if (!Number.isInteger(nextShares) || nextShares <= 0) {
      throw new Error("Enter a whole number of shares.");
    }
    setItems((current) => {
      const existing = current.find((item) => item.propertyId === property.id);
      if (existing) {
        return current.map((item) =>
          item.propertyId === property.id ? { ...item, shares: item.shares + nextShares } : item
        );
      }
      return [
        ...current,
        {
          propertyId: property.id,
          shares: nextShares,
          name: property.name,
          location: property.location,
          image: property.image,
          tokenSymbol: property.tokenSymbol,
          sharePrice: property.onChain?.sharePrice?.toString?.() || property.onChain?.sharePrice || "",
        },
      ];
    });
  }, []);

  const setShares = useCallback((propertyId, shares) => {
    const nextShares = Number(shares);
    if (!Number.isInteger(nextShares) || nextShares <= 0) return;
    setItems((current) =>
      current.map((item) => (item.propertyId === propertyId ? { ...item, shares: nextShares } : item))
    );
  }, []);

  const removeItem = useCallback((propertyId) => {
    setItems((current) => current.filter((item) => item.propertyId !== propertyId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, item) => sum + item.shares, 0);

  const value = useMemo(
    () => ({ items, count, addItem, setShares, removeItem, clearCart }),
    [items, count, addItem, setShares, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
