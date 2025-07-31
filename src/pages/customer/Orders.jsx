import React from 'react';
import { Package } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuthContext } from '../../contexts/AuthContext';
import { COLLECTIONS } from '../../utils/constants';
import OrderItem from '../../components/customer/OrderItem';
import Loading from '../../components/common/Loading';

const Orders = () => {
  const { user } = useAuthContext();
  
  const { documents: orders, loading } = useFirestore(
    COLLECTIONS.ORDERS,
    user ? [{ field: 'userId', operator: '==', value: user.uid }] : [],
    true
  );

  if (loading) {
    return <Loading text="Memuat pesanan..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h2>
          <p className="text-gray-600 mb-6">Anda belum pernah melakukan pemesanan</p>
          <div className="space-x-4">
            <Link to="/content" className="btn btn-primary">
              Jelajahi Konten
            </Link>
            <Link to="/merchandise" className="btn btn-secondary">
              Lihat Merchandise
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;