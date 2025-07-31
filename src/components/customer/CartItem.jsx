import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency, calculateDiscountPrice } from '../../utils/helpers';
import { useCartContext } from '../../contexts/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCartContext();

  const finalPrice = item.discount 
    ? calculateDiscountPrice(item.price, item.discount)
    : item.price;

  const handleQuantityChange = (newQuantity) => {
    updateQuantity(item.id, item.type, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.id, item.type);
  };

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
      <img
        src={item.image || '/api/placeholder/80/80'}
        alt={item.title || item.name}
        className="w-20 h-20 object-cover rounded"
      />

      <div className="flex-1">
        <h3 className="font-medium text-gray-900">
          {item.title || item.name}
        </h3>
        {item.type === 'content' && (
          <p className="text-sm text-gray-500">Berlangganan 1 bulan</p>
        )}
        
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-lg font-semibold text-primary-600">
            {formatCurrency(finalPrice)}
          </span>
          {item.discount > 0 && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(item.price)}
            </span>
          )}
        </div>
      </div>

      {item.type === 'merchandise' && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="p-1 rounded border border-gray-300 hover:bg-gray-50"
            disabled={item.quantity <= 1}
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="p-1 rounded border border-gray-300 hover:bg-gray-50"
            disabled={item.quantity >= item.stock}
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      <div className="text-right">
        <p className="font-semibold text-gray-900">
          {formatCurrency(finalPrice * (item.quantity || 1))}
        </p>
        <button
          onClick={handleRemove}
          className="mt-2 text-red-600 hover:text-red-800 p-1"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;