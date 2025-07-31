import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { useCartContext } from '../../contexts/CartContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useMidtrans } from '../../hooks/useMidtrans';
import { createDocument } from '../../services/firestore';
import { COLLECTIONS } from '../../utils/constants';
import { formatCurrency, generateOrderId } from '../../utils/helpers';
import CartItem from '../../components/customer/CartItem';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartContext();
  const { user, userData } = useAuthContext();
  const { processPayment, loading } = useMidtrans();

  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.11;
  const finalTotal = totalPrice + tax;

  const handleCheckout = async () => {
    if (!user || !userData) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }

    if (!userData.address) {
      toast.error('Silakan lengkapi alamat pengiriman di profil');
      navigate('/profile');
      return;
    }

    try {
      const orderId = generateOrderId();
      const orderData = {
        id: orderId,
        userId: user.uid,
        items: items.map(item => ({
          id: item.id,
          type: item.type,
          name: item.name || item.title,
          price: item.price,
          discount: item.discount || 0,
          quantity: item.quantity || 1,
          image: item.image
        })),
        totalAmount: finalTotal,
        paymentStatus: 'pending',
        shippingStatus: 'pending',
        shippingAddress: userData.address,
        midtransOrderId: orderId
      };

      const midtransData = {
        transaction_details: {
          order_id: orderId,
          gross_amount: finalTotal
        },
        customer_details: {
          first_name: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          billing_address: {
            address: userData.address.street,
            city: userData.address.city,
            postal_code: userData.address.postalCode
          }
        },
        item_details: items.map(item => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity || 1,
          name: item.name || item.title
        }))
      };

      await createDocument(COLLECTIONS.ORDERS, orderData);
      
      const result = await processPayment(midtransData);
      
      if (result.transaction_status === 'settlement' || result.transaction_status === 'pending') {
        clearCart();
        toast.success('Pesanan berhasil dibuat');
        navigate('/orders');
      }
    } catch (error) {
      toast.error('Gagal memproses pembayaran: ' + error.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-6">Belum ada item dalam keranjang Anda</p>
          <div className="space-x-4">
            <Link to="/content" className="btn btn-primary">
              Jelajahi Konten
            </Link>
            <Link to="/merchandise" className="btn btn-secondary">
              Lihat Merchandise
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={`${item.id}-${item.type}`} item={item} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN (11%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-6 btn btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <CreditCard size={20} />
              <span>{loading ? 'Memproses...' : 'Checkout'}</span>
            </button>

            <div className="mt-4 text-center">
              <Link to="/merchandise" className="text-primary-600 hover:text-primary-500 text-sm">
                ← Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;