import React, { useState } from 'react';
import { Search, Filter, Package, Truck, CheckCircle } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { updateDocument } from '../../services/firestore';
import { COLLECTIONS, ORDER_STATUS, SHIPPING_STATUS } from '../../utils/constants';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const { documents: orders, loading } = useFirestore(COLLECTIONS.ORDERS, [], true);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      await updateDocument(COLLECTIONS.ORDERS, orderId, { paymentStatus: newStatus });
      toast.success('Status pembayaran berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui status pembayaran');
    }
  };

  const handleUpdateShippingStatus = async (orderId, newStatus, tracking = '') => {
    try {
      const updateData = { shippingStatus: newStatus };
      if (tracking) {
        updateData.trackingNumber = tracking;
      }
      await updateDocument(COLLECTIONS.ORDERS, orderId, updateData);
      toast.success('Status pengiriman berhasil diperbarui');
      setShowOrderModal(false);
      setTrackingNumber('');
    } catch (error) {
      toast.error('Gagal memperbarui status pengiriman');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu Pembayaran';
      case 'paid': return 'Dibayar';
      case 'processing': return 'Diproses';
      case 'shipped': return 'Dikirim';
      case 'delivered': return 'Diterima';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Pesanan</h1>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pesanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Dibayar</option>
              <option value="processing">Diproses</option>
              <option value="shipped">Dikirim</option>
              <option value="delivered">Diterima</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Total: {filteredOrders.length} pesanan
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status Bayar</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status Kirim</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm">#{order.id.slice(-8)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{order.userId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                      {getStatusText(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.shippingStatus)}`}>
                      {getStatusText(order.shippingStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Detail Pesanan"
        size="large"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Order ID</label>
                <p className="mt-1 font-mono">#{selectedOrder.id.slice(-8)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total</label>
                <p className="mt-1 font-semibold text-lg">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Pembayaran</label>
              <select
                value={selectedOrder.paymentStatus}
                onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value)}
                className="input"
              >
                <option value="pending">Pending</option>
                <option value="paid">Dibayar</option>
                <option value="failed">Gagal</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Pengiriman</label>
              <select
                value={selectedOrder.shippingStatus}
                onChange={(e) => handleUpdateShippingStatus(selectedOrder.id, e.target.value)}
                className="input"
              >
                <option value="pending">Pending</option>
                <option value="processing">Diproses</option>
                <option value="shipped">Dikirim</option>
                <option value="delivered">Diterima</option>
                <option value="returned">Dikembalikan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Resi</label>
              <div className="flex space-x-2">
                <input
                  value={trackingNumber || selectedOrder.trackingNumber || ''}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input flex-1"
                  placeholder="Masukkan nomor resi"
                />
                <button
                  onClick={() => handleUpdateShippingStatus(selectedOrder.id, selectedOrder.shippingStatus, trackingNumber)}
                  className="btn btn-primary"
                >
                  Update
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || '/api/placeholder/40/40'}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;