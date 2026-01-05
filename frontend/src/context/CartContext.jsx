import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // 1. Initialisation sécurisée
  const [cart, setCart] = useState(() => {
    try {
      const localData = localStorage.getItem('empire_cart');
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // 2. Sauvegarde automatique
  useEffect(() => {
    localStorage.setItem('empire_cart', JSON.stringify(cart));
  }, [cart]);

  // 3. Fonction d'ajout robuste
  const addToCart = (product, quantity = 1) => {
    console.log("🛒 Ajout au panier :", product.name, "Qté:", quantity);
    
    setCart(currentCart => {
      // On vérifie si l'article est déjà là
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        // Si oui, on met à jour la quantité
        const newCart = [...currentCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Sinon, on l'ajoute
        return [...currentCart, { ...product, quantity }];
      }
    });
    
    setIsCartOpen(true); // Ouvre le panneau pour confirmer visuellement
  };

  const removeFromCart = (productId) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('empire_cart');
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Calcul du nombre TOTAL d'articles (pas juste le nombre de lignes)
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartCount, // <-- On exporte le compte total
      addToCart, 
      removeFromCart, 
      clearCart, 
      isCartOpen, 
      toggleCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};