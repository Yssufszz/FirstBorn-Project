import React, { useState } from 'react';
import { Search, Filter, UserCheck, UserX, Download, MoreVertical } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { updateDocument } from '../../services/firestore';
import { COLLECTIONS, USER_ROLES } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const { documents: users, loading } = useFirestore(COLLECTIONS.USERS, [], true);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      await updateDocument(COLLECTIONS.USERS, userId, { isBlocked: !isBlocked });
      toast.success(`User ${!isBlocked ? 'diblokir' : 'dibuka blokir'}`);
    } catch (error) {
      toast.error('Gagal mengubah status user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDocument(COLLECTIONS.USERS, userId, { role: newRole });
      toast.success('Role user berhasil diubah');
      setShowUserModal(false);
    } catch (error) {
      toast.error('Gagal mengubah role user');
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Nama', 'Email', 'Username', 'Role', 'Status', 'Tanggal Daftar'].join(','),
      ...filteredUsers.map(user => [
        user.fullName,
        user.email,
        user.username,
        user.role,
        user.isBlocked ? 'Diblokir' : 'Aktif',
        formatDateTime(user.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
        <button
          onClick={exportUsers}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <Download size={16} />
          <span>Export Data</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Semua Role</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Total: {filteredUsers.length} user
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal Daftar</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || '/api/placeholder/40/40'}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'moderator'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isBlocked 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isBlocked ? 'Diblokir' : 'Aktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleBlockUser(user.id, user.isBlocked)}
                        className={`p-2 rounded-lg ${
                          user.isBlocked
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={user.isBlocked ? 'Buka Blokir' : 'Blokir User'}
                      >
                        {user.isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="Detail User"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Detail User"
        size="large"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={selectedUser.avatar || '/api/placeholder/80/80'}
                alt={selectedUser.fullName}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold">{selectedUser.fullName}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-500">@{selectedUser.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                  className="mt-1 input"
                >
                  <option value="customer">Customer</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className={`mt-1 px-2 py-1 rounded text-sm ${
                  selectedUser.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {selectedUser.isBlocked ? 'Diblokir' : 'Aktif'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor HP</label>
                <p className="mt-1 text-gray-900">{selectedUser.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Usia</label>
                <p className="mt-1 text-gray-900">{selectedUser.age || '-'} tahun</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <p className="mt-1 text-gray-900">
                {selectedUser.address ? 
                  `${selectedUser.address.street}, ${selectedUser.address.city}, ${selectedUser.address.province}` 
                  : '-'
                }
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;