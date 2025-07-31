import React from 'react';
import { ShoppingCart, Star, Tag } from 'lucide-react';
import { formatCurrency, calculateDiscountPrice } from '../../utils/helpers';
import { useCartContext } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

const MerchandiseCard = ({ product }) => {
  const { addItem } = useCartContext();

  const finalPrice = product.discount 
    ? calculateDiscountPrice(product.price, product.discount)
    : product.price;

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Stok tidak tersedia');
      return;
    }

    addItem({
      id: product.id,
      type: 'merchandise',
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.images[0],
      stock: product.stock
    });
    toast.success('Produk ditambahkan ke keranjang');
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.images[0] || '/api/placeholder/300/300'}
          alt={product.name}
          className="w-full h-64 object-cover rounded-lg"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
            <Tag size={12} className="mr-1" />
            {product.discount}% OFF
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <span className="text-white font-medium">Stok Habis</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center text-yellow-500">
            <Star size={16} className="mr-1" fill="currentColor" />
            <span className="text-sm">4.7</span>
            <span className="text-gray-500 text-xs ml-1">(24)</span>
          </div>
          <p className="text-sm text-gray-500">Stok: {product.stock}</p>
        </div>

        <div className="mt-3">
          {product.discount > 0 ? (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary-600">
                {formatCurrency(finalPrice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full mt-4 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <ShoppingCart size={16} />
          <span>{product.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
        </button>
      </div>
    </div>
  );
};

export default MerchandiseCard;