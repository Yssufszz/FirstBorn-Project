import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../../services/auth';
import { validateEmail } from '../../../utils/validation';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Email reset password telah dikirim');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <Mail size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Email Terkirim</h2>
            <p className="text-gray-600 mb-6">
              Kami telah mengirim link reset password ke email <strong>{email}</strong>. 
              Silakan cek inbox atau spam folder Anda.
            </p>
            <Link to="/login" className="btn btn-primary">
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/login" className="flex items-center text-primary-600 hover:text-primary-500 mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Login
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Lupa Password?
          </h2>
          <p className="text-gray-600">
            Masukkan email Anda dan kami akan mengirim link untuk reset password.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1"
              placeholder="Masukkan email Anda"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;