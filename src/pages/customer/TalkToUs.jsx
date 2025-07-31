import React, { useState } from 'react';
import { Send, MessageSquare, Inbox } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuthContext } from '../../contexts/AuthContext';
import { createDocument } from '../../services/firestore';
import { COLLECTIONS, MESSAGE_STATUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';
import { validateRequired } from '../../utils/validation';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const TalkToUs = () => {
  const { user, userData } = useAuthContext();
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { documents: sentMessages, loading: sentLoading } = useFirestore(
    COLLECTIONS.MESSAGES,
    user ? [{ field: 'userId', operator: '==', value: user.uid }] : [],
    true
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const subjectError = validateRequired(formData.subject, 'Subjek');
    if (subjectError) newErrors.subject = subjectError;
    
    const messageError = validateRequired(formData.message, 'Pesan');
    if (messageError) newErrors.message = messageError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createDocument(COLLECTIONS.MESSAGES, {
        userId: user.uid,
        userEmail: userData.email,
        userName: userData.fullName,
        subject: formData.subject,
        message: formData.message,
        status: MESSAGE_STATUS.UNREAD,
        reply: ''
      });

      setFormData({ subject: '', message: '' });
      toast.success('Pesan berhasil dikirim');
      setActiveTab('sent');
    } catch (error) {
      toast.error('Gagal mengirim pesan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCreateMessage = () => (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kirim Pesan Baru</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subjek
          </label>
          <input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`input ${errors.subject ? 'border-red-500' : ''}`}
            placeholder="Masukkan subjek pesan"
          />
          {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pesan
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            className={`input resize-none ${errors.message ? 'border-red-500' : ''}`}
            placeholder="Tulis pesan Anda..."
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary disabled:opacity-50 flex items-center space-x-2"
        >
          <Send size={16} />
          <span>{loading ? 'Mengirim...' : 'Kirim Pesan'}</span>
        </button>
      </form>
    </div>
  );

  const renderSentMessages = () => (
    <div className="space-y-4">
      {sentMessages.length > 0 ? (
        sentMessages.map((message) => (
          <div key={message.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{message.subject}</h4>
                <p className="text-sm text-gray-500">{formatDateTime(message.createdAt)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                message.status === MESSAGE_STATUS.REPLIED
                  ? 'bg-green-100 text-green-800'
                  : message.status === MESSAGE_STATUS.READ
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {message.status === MESSAGE_STATUS.REPLIED
                  ? 'Dibalas'
                  : message.status === MESSAGE_STATUS.READ
                  ? 'Dibaca'
                  : 'Belum dibaca'
                }
              </span>
            </div>
            
            <p className="text-gray-700 mb-3">{message.message}</p>
            
            {message.reply && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Balasan dari Admin:</h5>
                <p className="text-gray-700">{message.reply}</p>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Pesan</h3>
          <p className="text-gray-600">Anda belum pernah mengirim pesan</p>
        </div>
      )}
    </div>
  );

  const renderMailbox = () => {
    const repliedMessages = sentMessages.filter(msg => msg.status === MESSAGE_STATUS.REPLIED);
    
    return (
      <div className="space-y-4">
        {repliedMessages.length > 0 ? (
          repliedMessages.map((message) => (
            <div key={message.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">Re: {message.subject}</h4>
                  <p className="text-sm text-gray-500">Balasan dari Admin</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Dibalas
                </span>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Pesan Asli Anda:</h5>
                <p className="text-gray-700 text-sm">{message.message}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Balasan Admin:</h5>
                <p className="text-gray-700">{message.reply}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Inbox size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Balasan</h3>
            <p className="text-gray-600">Belum ada balasan dari admin</p>
          </div>
        )}
      </div>
    );
  };

  if (sentLoading) {
    return <Loading text="Memuat pesan..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hubungi Kami</h1>
        <p className="text-gray-600">
          Ada pertanyaan atau masukan? Jangan ragu untuk menghubungi tim kami.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'create'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send size={16} />
            <span>Buat Pesan</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'sent'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare size={16} />
            <span>Pesan Terkirim</span>
          </button>
          <button
            onClick={() => setActiveTab('mailbox')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'mailbox'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Inbox size={16} />
            <span>Kotak Masuk</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' && renderCreateMessage()}
      {activeTab === 'sent' && renderSentMessages()}
      {activeTab === 'mailbox' && renderMailbox()}
    </div>
  );
};

export default TalkToUs;