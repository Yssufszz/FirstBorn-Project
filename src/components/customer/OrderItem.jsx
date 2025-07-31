import React from 'react';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { ORDER_STATUS, SHIPPING_STATUS } from '../../utils/constants';

const OrderItem = ({ order }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PROCESSING:
        return <Package className="text-blue-500" size={20} />;
      case ORDER_STATUS.SHIPPED:
        return <Truck className="text-orange-500" size={20} />;
      case ORDER_STATUS.DELIVERED:
        return <CheckCircle className="text-green-500" size={20} />;
      case ORDER_STATUS.CANCELLED:
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'Menunggu Pembayaran';
      case ORDER_STATUS.PAID:
        return 'Dibayar';
      case ORDER_STATUS.PROCESSING:
        return 'Diproses';
      case ORDER_STATUS.SHIPPED:
        return 'Dikirim';
      case ORDER_STATUS.DELIVERED:
        return 'Diterima';
      case ORDER_STATUS.CANCELLED:
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</h3>
          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.paymentStatus)}
          <span className="text-sm font-medium">{getStatusText(order.paymentStatus)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <img
              src={item.image || '/api/placeholder/50/50'}
              alt={item.name || item.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name || item.title}</p>
              <p className="text-xs text-gray-500">
                {item.quantity}x {formatCurrency(item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="font-semibold text-lg">{formatCurrency(order.totalAmount)}</p>
        </div>
        
        {order.trackingNumber && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Resi</p>
            <p className="font-mono text-sm">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      {order.paymentStatus === ORDER_STATUS.PENDING && (
        <button className="w-full mt-4 btn btn-primary">
          Bayar Sekarang
        </button>
      )}
    </div>
  );
};

export default OrderItem;