import React from 'react';
import { Users, PlayCircle, ShoppingBag, Package, MessageSquare, TrendingUp } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { COLLECTIONS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

const Dashboard = () => {
  const { documents: users } = useFirestore(COLLECTIONS.USERS);
  const { documents: content } = useFirestore(COLLECTIONS.CONTENT);
  const { documents: merchandise } = useFirestore(COLLECTIONS.MERCHANDISE);
  const { documents: orders } = useFirestore(COLLECTIONS.ORDERS);
  const { documents: messages } = useFirestore(COLLECTIONS.MESSAGES);

  const totalRevenue = orders
    .filter(order => order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'bg-blue-500',
      growth: '+12%'
    },
    {
      title: 'Total Konten',
      value: content.length,
      icon: PlayCircle,
      color: 'bg-green-500',
      growth: '+8%'
    },
    {
      title: 'Total Produk',
      value: merchandise.length,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      growth: '+15%'
    },
    {
      title: 'Total Pesanan',
      value: orders.length,
      icon: Package,
      color: 'bg-orange-500',
      growth: '+25%'
    },
    {
      title: 'Pesan Masuk',
      value: messages.filter(m => m.status === 'unread').length,
      icon: MessageSquare,
      color: 'bg-red-500',
      growth: '+5%'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: 'bg-yellow-500',
      growth: '+30%'
    }
  ];

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentUsers = users
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Selamat datang di panel administrasi FirstBorn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-green-600 font-medium">{stat.growth}</span>
                    <span className="text-sm text-gray-500 ml-1">vs bulan lalu</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pesanan Terbaru</h3>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(order.totalAmount)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Dibayar' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Terbaru</h3>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={user.avatar || '/api/placeholder/40/40'}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;