import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuthContext } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id && item.type === action.payload.type);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && item.type === action.payload.type
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => !(item.id === action.payload.id && item.type === action.payload.type))
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id && item.type === action.payload.type
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user.uid}`);
      if (savedCart) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
      }
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [user]);

  useEffect(() => {
    if (user && state.items.length > 0) {
      localStorage.setItem(`cart_${user.uid}`, JSON.stringify(state.items));
    }
  }, [state.items, user]);

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id, type) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, type } });
  };

  const updateQuantity = (id, type, quantity) => {
    if (quantity <= 0) {
      removeItem(id, type);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, type, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    if (user) {
      localStorage.removeItem(`cart_${user.uid}`);
    }
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      const price = item.discount 
        ? item.price - (item.price * item.discount / 100)
        : item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};