import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'rentease_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // product: full product object from the API (includes tenurePricing)
  const addItem = (product, tenureMonths) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, tenureMonths } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          category: product.category,
          securityDeposit: parseFloat(product.securityDeposit),
          tenurePricing: product.tenurePricing,
          tenureMonths,
        },
      ];
    });
  };

  const updateTenure = (productId, tenureMonths) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, tenureMonths } : i)));
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const getMonthlyRent = (item) => {
    const match = item.tenurePricing?.find((t) => t.months === item.tenureMonths);
    return match ? match.monthlyRent : 0;
  };

  const totalMonthly = items.reduce((sum, i) => sum + getMonthlyRent(i), 0);
  const totalDeposit = items.reduce((sum, i) => sum + i.securityDeposit, 0);

  const value = {
    items,
    addItem,
    updateTenure,
    removeItem,
    clearCart,
    getMonthlyRent,
    totalMonthly,
    totalDeposit,
    totalItems: items.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
