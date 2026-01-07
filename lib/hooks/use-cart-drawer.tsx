/**
 * Cart Drawer Hook
 * 
 * Global state management for cart drawer open/close.
 */

import * as React from "react";

interface CartDrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartDrawerContext = React.createContext<CartDrawerContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function CartDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <CartDrawerContext.Provider value={{ isOpen, open, close }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer(): CartDrawerContextType {
  const context = React.useContext(CartDrawerContext);
  if (!context) {
    throw new Error("useCartDrawer must be used within CartDrawerProvider");
  }
  return context;
}

