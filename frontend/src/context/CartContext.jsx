import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to merge two carts
  const mergeCarts = (localCart, dbCart) => {
    const merged = [...dbCart];
    
    localCart.forEach(localItem => {
      const matchIndex = merged.findIndex(
        item => 
          item.productId === localItem.productId && 
          item.color === localItem.color && 
          item.size === localItem.size
      );

      if (matchIndex > -1) {
        merged[matchIndex].quantity += localItem.quantity;
      } else {
        merged.push(localItem);
      }
    });

    return merged;
  };

  // Load cart initially
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Logged in: Sync guest cart with user cart if there is a guest cart
        const guestCartStr = localStorage.getItem('cart_guest');
        const guestCart = guestCartStr ? JSON.parse(guestCartStr) : [];
        const userCart = user.cart || [];

        if (guestCart.length > 0) {
          const merged = mergeCarts(guestCart, userCart);
          setCart(merged);
          try {
            await api.auth.syncCart(merged);
            localStorage.removeItem('cart_guest'); // Clear guest cart
          } catch (err) {
            console.error('Failed to sync merged cart to backend:', err.message);
          }
        } else {
          setCart(userCart);
        }
      } else {
        // Guest: load from local storage
        const guestCartStr = localStorage.getItem('cart_guest');
        setCart(guestCartStr ? JSON.parse(guestCartStr) : []);
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Sync cart helper
  const updateCartStateAndSync = async (newCart) => {
    setCart(newCart);
    if (user) {
      try {
        await api.auth.syncCart(newCart);
      } catch (err) {
        console.error('Failed to sync cart to backend:', err.message);
      }
    } else {
      localStorage.setItem('cart_guest', JSON.stringify(newCart));
    }
  };

  const addToCart = (product, quantity = 1, color = null, size = null) => {
    const newCart = [...cart];
    const matchIndex = newCart.findIndex(
      item => 
        item.productId === product.id && 
        item.color === color && 
        item.size === size
    );

    if (matchIndex > -1) {
      newCart[matchIndex].quantity += quantity;
    } else {
      newCart.push({
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        quantity,
        color,
        size
      });
    }

    updateCartStateAndSync(newCart);
  };

  const removeFromCart = (productId, color = null, size = null) => {
    const newCart = cart.filter(
      item => 
        !(item.productId === productId && 
          item.color === color && 
          item.size === size)
    );
    updateCartStateAndSync(newCart);
  };

  const updateQuantity = (productId, quantity, color = null, size = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    const newCart = cart.map(item => {
      if (item.productId === productId && item.color === color && item.size === size) {
        return { ...item, quantity };
      }
      return item;
    });
    updateCartStateAndSync(newCart);
  };

  const clearCart = () => {
    updateCartStateAndSync([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartTotal, 
      getCartItemsCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
