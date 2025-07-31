import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/customer/Home';
import Content from './pages/customer/Content';
import ContentDetail from './pages/customer/ContentDetail';
import Merchandise from './pages/customer/Merchandise';
import Cart from './pages/customer/Cart';
import Orders from './pages/customer/Orders';
import TalkToUs from './pages/customer/TalkToUs';
import Profile from './pages/customer/Profile';
import Login from './pages/customer/auth/Login';
import Register from './pages/customer/auth/Register';
import ForgotPassword from './pages/customer/auth/ForgotPassword';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminContent from './pages/admin/Content';
import AdminMerchandise from './pages/admin/Merchandise';
import AdminOrders from './pages/admin/Orders';
import AdminMessages from './pages/admin/Messages';

import './utils/i18n';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                <Route path="/admin/login" element={<AdminLogin />} />
                
                <Route path="/" element={<CustomerLayout />}>
                  <Route index element={<Home />} />
                  <Route path="content" element={<Content />} />
                  <Route path="merchandise" element={<Merchandise />} />
                  <Route path="cart" element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="talk-to-us" element={
                    <ProtectedRoute>
                      <TalkToUs />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                </Route>

                <Route path="content/:id" element={
                  <ProtectedRoute>
                    <ContentDetail />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="merchandise" element={<AdminMerchandise />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="messages" element={<AdminMessages />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: '#4aed88',
                    },
                  },
                }}
              />
            </div>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;