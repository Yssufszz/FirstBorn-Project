import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCartContext } from '../../contexts/CartContext';
import { logoutUser } from '../../services/auth';
import LanguageSwitcher from './LanguageSwitcher';
import toast from 'react-hot-toast';

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, userData } = useAuthContext();
  const { getTotalItems } = useCartContext();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success(t('auth.logoutSuccess'));
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary-600">FirstBorn</h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('navigation.home')}
            </Link>
            <Link to="/content" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('navigation.content')}
            </Link>
            <Link to="/merchandise" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('navigation.merchandise')}
            </Link>
            <Link to="/talk-to-us" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('navigation.talkToUs')}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {user ? (
              <>
                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <ShoppingCart size={24} />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <User size={24} />
                    <span className="hidden md:block">{userData?.fullName || user.email}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {t('navigation.profile')}
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {t('navigation.orders')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>{t('auth.logout')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn btn-primary">
                  {t('auth.login')}
                </Link>
                <Link to="/register" className="btn btn-secondary">
                  {t('auth.register')}
                </Link>
              </div>
            )}

            <button className="md:hidden p-2 text-gray-700">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;