import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Edit3, Save, X } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { updateDocument } from '../../services/firestore';
import { useStorage } from '../../hooks/useStorage';
import { COLLECTIONS, GENDER_OPTIONS, JOB_OPTIONS, CHILD_ORDER_OPTIONS } from '../../utils/constants';
import { validateRequired, validatePhone, validateAge } from '../../utils/validation';
import AddressForm from '../../components/forms/AddressForm';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, userData } = useAuthContext();
  const { upload } = useStorage();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    phone: userData?.phone || '',
    gender: userData?.gender || '',
    age: userData?.age || '',
    address: userData?.address || null,
    job: userData?.job || '',
    childOrder: userData?.childOrder || '',
    paymentMethod: userData?.paymentMethod || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files[0]) {
      setAvatarFile(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressChange = (address) => {
    setFormData(prev => ({ ...prev, address }));
    setShowAddressModal(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateRequired(formData.fullName, 'Nama lengkap');
    if (nameError) newErrors.fullName = nameError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const ageError = validateAge(formData.age);
    if (ageError) newErrors.age = ageError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let updateData = { ...formData };
      
      if (avatarFile) {
        const avatarUrl = await upload(avatarFile, `avatars/${user.uid}_${Date.now()}`);
        updateData.avatar = avatarUrl;
      }

      await updateDocument(COLLECTIONS.USERS, user.uid, {
        ...updateData,
        age: parseInt(updateData.age),
        childOrder: parseInt(updateData.childOrder)
      });

      setIsEditing(false);
      setAvatarFile(null);
      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui profil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: userData?.fullName || '',
      phone: userData?.phone || '',
      gender: userData?.gender || '',
      age: userData?.age || '',
      address: userData?.address || null,
      job: userData?.job || '',
      childOrder: userData?.childOrder || '',
      paymentMethod: userData?.paymentMethod || ''
    });
    setErrors({});
    setAvatarFile(null);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Edit3 size={16} />
            <span>Edit Profil</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <X size={16} />
              <span>Batal</span>
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="relative inline-block">
              <img
                src={userData?.avatar || '/api/placeholder/120/120'}
                alt="Avatar"
                className="w-32 h-32 rounded-full mx-auto object-cover"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                  <Edit3 size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    name="avatar"
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              {userData?.fullName}
            </h3>
            <p className="text-gray-600">{userData?.email}</p>
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              <User size={16} className="mr-1" />
              <span>Member sejak {new Date(userData?.createdAt).getFullYear()}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                {isEditing ? (
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`input ${errors.fullName ? 'border-red-500' : ''}`}
                  />
                ) : (
                  <p className="text-gray-900">{userData?.fullName}</p>
                )}
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900 flex items-center">
                  <Mail size={16} className="mr-2 text-gray-400" />
                  {userData?.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor HP
                </label>
                {isEditing ? (
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input ${errors.phone ? 'border-red-500' : ''}`}
                  />
                ) : (
                  <p className="text-gray-900 flex items-center">
                    <Phone size={16} className="mr-2 text-gray-400" />
                    {userData?.phone}
                  </p>
                )}
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    {GENDER_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {GENDER_OPTIONS.find(g => g.value === userData?.gender)?.label || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usia
                </label>
                {isEditing ? (
                  <input
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    className={`input ${errors.age ? 'border-red-500' : ''}`}
                  />
                ) : (
                  <p className="text-gray-900">{userData?.age} tahun</p>
                )}
                {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pekerjaan
                </label>
                {isEditing ? (
                  <select
                    name="job"
                    value={formData.job}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Pilih pekerjaan</option>
                    {JOB_OPTIONS.map(job => (
                      <option key={job} value={job}>{job}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 flex items-center">
                    <Briefcase size={16} className="mr-2 text-gray-400" />
                    {userData?.job || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anak Ke-
                </label>
                {isEditing ? (
                  <select
                    name="childOrder"
                    value={formData.childOrder}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Pilih urutan anak</option>
                    {CHILD_ORDER_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {CHILD_ORDER_OPTIONS.find(c => c.value === userData?.childOrder)?.label || '-'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metode Pembayaran
                </label>
                {isEditing ? (
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Pilih metode pembayaran</option>
                    <option value="credit_card">Kartu Kredit</option>
                    <option value="bank_transfer">Transfer Bank</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="qris">QRIS</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{userData?.paymentMethod || '-'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alamat</h3>
              {isEditing && (
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-primary-600 hover:text-primary-500 text-sm"
                >
                  Ubah Alamat
                </button>
              )}
            </div>
            
            {userData?.address ? (
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-900">{userData.address.street}</p>
                  <p className="text-gray-600">
                    {userData.address.city}, {userData.address.province}
                  </p>
                  <p className="text-gray-600">{userData.address.postalCode}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Alamat belum diatur</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Ubah Alamat"
        size="large"
      >
        <AddressForm onAddressChange={handleAddressChange} />
      </Modal>
    </div>
  );
};

export default Profile;