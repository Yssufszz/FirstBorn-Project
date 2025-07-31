import React, { useState } from 'react';
import { Search, MessageSquare, Send, Filter } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { updateDocument } from '../../services/firestore';
import { COLLECTIONS, MESSAGE_STATUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const { documents: messages, loading: messagesLoading } = useFirestore(COLLECTIONS.MESSAGES, [], true);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      await updateDocument(COLLECTIONS.MESSAGES, selectedMessage.id, {
        reply: replyText,
        status: MESSAGE_STATUS.REPLIED,
        repliedAt: new Date()
      });

      toast.success('Reply berhasil dikirim');
      setReplyText('');
      setShowMessageModal(false);
    } catch (error) {
      toast.error('Gagal mengirim reply');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await updateDocument(COLLECTIONS.MESSAGES, messageId, {
        status: MESSAGE_STATUS.READ,
        readAt: new Date()
      });
    } catch (error) {
      toast.error('Gagal mengubah status pesan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case MESSAGE_STATUS.UNREAD: return 'bg-blue-100 text-blue-800';
      case MESSAGE_STATUS.READ: return 'bg-yellow-100 text-yellow-800';
      case MESSAGE_STATUS.REPLIED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case MESSAGE_STATUS.UNREAD: return 'Belum Dibaca';
      case MESSAGE_STATUS.READ: return 'Dibaca';
      case MESSAGE_STATUS.REPLIED: return 'Dibalas';
      default: return status;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Pesan</h1>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pesan..."
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
              <option value="unread">Belum Dibaca</option>
              <option value="read">Dibaca</option>
              <option value="replied">Dibalas</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Total: {filteredMessages.length} pesan
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <div key={message.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                    {getStatusText(message.status)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{message.userName}</span> - {message.userEmail}
                </div>
                
                <p className="text-gray-700 line-clamp-2">{message.message}</p>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500">{formatDateTime(message.createdAt)}</span>
                  
                  <div className="flex space-x-2">
                    {message.status === MESSAGE_STATUS.UNREAD && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Tandai Dibaca
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowMessageModal(true);
                        if (message.status === MESSAGE_STATUS.UNREAD) {
                          handleMarkAsRead(message.id);
                        }
                      }}
                      className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                    >
                      {message.status === MESSAGE_STATUS.REPLIED ? 'Lihat Detail' : 'Balas'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pesan</h3>
          <p className="text-gray-600">Belum ada pesan dari customer</p>
        </div>
      )}

      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title="Detail Pesan"
        size="large"
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{selectedMessage.subject}</h3>
              <div className="text-sm text-gray-600 mb-4">
                <p><strong>Dari:</strong> {selectedMessage.userName} ({selectedMessage.userEmail})</p>
                <p><strong>Tanggal:</strong> {formatDateTime(selectedMessage.createdAt)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Pesan:</h4>
              <p className="text-gray-700">{selectedMessage.message}</p>
            </div>

            {selectedMessage.reply && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Reply Anda:</h4>
                <p className="text-gray-700">{selectedMessage.reply}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Dikirim: {formatDateTime(selectedMessage.repliedAt)}
                </p>
              </div>
            )}

            {selectedMessage.status !== MESSAGE_STATUS.REPLIED && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tulis Reply:
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="4"
                  className="input resize-none"
                  placeholder="Tulis balasan untuk customer..."
                />
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleReply}
                    disabled={loading || !replyText.trim()}
                    className="btn btn-primary disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>{loading ? 'Mengirim...' : 'Kirim Reply'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;