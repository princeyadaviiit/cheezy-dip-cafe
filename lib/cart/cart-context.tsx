"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { type MenuItem } from "@/lib/menu-data";

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: string[];
  optionsPriceDeltaMinor: number;
  itemTotalMinor: number;
  note?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    item: MenuItem,
    quantity?: number,
    selectedOptions?: string[],
    note?: string
  ) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotalMinor: number;
  orderType: "dine_in" | "delivery";
  setOrderType: (type: "dine_in" | "delivery") => void;
  tableLabel: string | null;
  setTableLabel: (label: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cheezy_dip_cart_v1";
const ORDER_TYPE_KEY = "cheezy_dip_order_type_v1";

function generateCartItemId(itemId: string, options: string[] = []): string {
  const sortedOpts = [...options].sort().join("|");
  return sortedOpts ? `${itemId}::${sortedOpts}` : itemId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [orderType, setOrderTypeState] = useState<"dine_in" | "delivery">(() => {
    if (typeof window === "undefined") return "dine_in";
    try {
      const stored = localStorage.getItem(ORDER_TYPE_KEY);
      return stored === "dine_in" || stored === "delivery" ? stored : "dine_in";
    } catch {
      return "dine_in";
    }
  });

  const [tableLabel, setTableLabel] = useState<string | null>(null);

  // Sync cart to localStorage upon changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(ORDER_TYPE_KEY, orderType);
    } catch {
      // Ignore storage errors
    }
  }, [items, orderType]);

  const addItem = (
    item: MenuItem,
    quantity = 1,
    selectedOptions: string[] = [],
    note?: string
  ) => {
    // Calculate options price delta
    let optionsDelta = 0;
    if (selectedOptions.length > 0 && item.options) {
      for (const optName of selectedOptions) {
        for (const optGroup of item.options) {
          const match = optGroup.choices.find((c) => c.label === optName);
          if (match) {
            optionsDelta += match.priceDeltaMinor;
            break;
          }
        }
      }
    }

    const cartItemId = generateCartItemId(item.id, selectedOptions);

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx >= 0) {
        const updated = [...prevItems];
        const current = updated[existingIdx];
        const newQty = Math.min(50, current.quantity + quantity);
        updated[existingIdx] = {
          ...current,
          quantity: newQty,
          itemTotalMinor: (current.menuItem.priceMinor + current.optionsPriceDeltaMinor) * newQty,
          note: note !== undefined ? note : current.note,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId,
          menuItem: item,
          quantity,
          selectedOptions,
          optionsPriceDeltaMinor: optionsDelta,
          itemTotalMinor: (item.priceMinor + optionsDelta) * quantity,
          note,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: Math.min(50, newQty),
              itemTotalMinor: (item.menuItem.priceMinor + item.optionsPriceDeltaMinor) * Math.min(50, newQty),
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const setOrderType = (type: "dine_in" | "delivery") => {
    setOrderTypeState(type);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalMinor = items.reduce((sum, item) => sum + item.itemTotalMinor, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalCount,
        subtotalMinor,
        orderType,
        setOrderType,
        tableLabel,
        setTableLabel,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
