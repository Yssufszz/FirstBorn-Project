import React from 'react';
import { Play, Clock, Star } from 'lucide-react';
import { formatCurrency, formatDuration } from '../../utils/helpers';
import { useCartContext } from '../../contexts/CartContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ContentCard = ({ content, isSubscribed = false }) => {
  const { addItem } = useCartContext();

  const handleSubscribe = () => {
    addItem({
      id: content.id,
      type: 'content',
      title: content.title,
      price: content.price,
      duration: content.duration,
      image: content.thumbnail
    });
    toast.success('Konten ditambahkan ke keranjang');
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={content.thumbnail || '/api/placeholder/300/200'}
          alt={content.title}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <button className="p-3 bg-white rounded-full text-primary-600 hover:bg-gray-100">
            <Play size={24} fill="currentColor" />
          </button>
        </div>
        {content.isSubscription && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
            Premium
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {content.title}
        </h3>
        <p className="text-gray-600 text-sm mt-2 line-clamp-3">
          {content.description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500">
              <Clock size={16} className="mr-1" />
              <span className="text-sm">{formatDuration(content.duration)}</span>
            </div>
            <div className="flex items-center text-yellow-500">
              <Star size={16} className="mr-1" fill="currentColor" />
              <span className="text-sm">4.8</span>
            </div>
          </div>
          
          <div className="text-right">
            {content.isSubscription ? (
              <>
                <p className="text-lg font-bold text-primary-600">
                  {formatCurrency(content.price)}
                </p>
                <p className="text-xs text-gray-500">/bulan</p>
              </>
            ) : (
              <p className="text-lg font-bold text-green-600">Gratis</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          {isSubscribed || !content.isSubscription ? (
            <Link to={`/content/${content.id}`} className="flex-1 btn btn-primary text-center">
              Dengarkan Sekarang
            </Link>
          ) : (
            <button
              onClick={handleSubscribe}
              className="flex-1 btn btn-primary"
            >
              Berlangganan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;