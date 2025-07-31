import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  PlayCircle, 
  ShoppingBag, 
  Package, 
  MessageSquare, 
  LogOut,
  Settings
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/auth';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logout berhasil');
      navigate('/admin/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Manajemen User' },
    { path: '/admin/content', icon: PlayCircle, label: 'Manajemen Konten' },
    { path: '/admin/merchandise', icon: ShoppingBag, label: 'Manajemen Merchandise' },
    { path: '/admin/orders', icon: Package, label: 'Manajemen Pesanan' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Pesan & Komunikasi' }
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-primary-600">FirstBorn</h2>
        <p className="text-sm text-gray-600">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={userData?.avatar || '/api/placeholder/40/40'}
            alt="Admin"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">{userData?.fullName}</p>
            <p className="text-sm text-gray-600">Administrator</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;