import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // On essaie de récupérer le panier du localStorage au chargement
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('ecommerce_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sauvegarde automatique dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (indexToRemove) => {
    setCart((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // NOUVELLE FONCTION : Vider le panier
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('ecommerce_cart');
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, // <--- On expose la fonction ici
      cartTotal, 
      isCartOpen, 
      setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);