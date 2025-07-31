import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../../services/auth';
import { useStorage } from '../../hooks/useStorage';
import { validateEmail, validatePassword, validatePhone, validateAge, validateRequired } from '../../utils/validation';
import { GENDER_OPTIONS, JOB_OPTIONS, CHILD_ORDER_OPTIONS } from '../../utils/constants';
import AddressForm from './AddressForm';
import toast from 'react-hot-toast';

const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { upload } = useStorage();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    gender: '',
    age: '',
    address: null,
    job: '',
    childOrder: '',
    password: '',
    avatar: null,
    paymentMethod: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files[0]) {
      setAvatarFile(files[0]);
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressChange = (address) => {
    setFormData(prev => ({ ...prev, address }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    const nameError = validateRequired(formData.fullName, 'Nama lengkap');
    if (nameError) newErrors.fullName = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const usernameError = validateRequired(formData.username, 'Username');
    if (usernameError) newErrors.username = usernameError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const genderError = validateRequired(formData.gender, 'Jenis kelamin');
    if (genderError) newErrors.gender = genderError;
    
    const ageError = validateAge(formData.age);
    if (ageError) newErrors.age = ageError;
    
    if (!formData.address) {
      newErrors.address = 'Alamat wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    const jobError = validateRequired(formData.job, 'Pekerjaan');
    if (jobError) newErrors.job = jobError;
    
    const childOrderError = validateRequired(formData.childOrder, 'Anak ke');
    if (childOrderError) newErrors.childOrder = childOrderError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    setLoading(true);
    try {
      let avatarUrl = '';
      if (avatarFile) {
        avatarUrl = await upload(avatarFile, `avatars/${Date.now()}_${avatarFile.name}`);
      }

      const userData = {
        ...formData,
        avatar: avatarUrl,
        age: parseInt(formData.age),
        childOrder: parseInt(formData.childOrder)
      };
      delete userData.avatar;

      await registerUser(userData);
      toast.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`input mt-1 ${errors.fullName ? 'border-red-500' : ''}`}
          placeholder="Masukkan nama lengkap"
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`input mt-1 ${errors.email ? 'border-red-500' : ''}`}
          placeholder="Masukkan email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`input mt-1 ${errors.username ? 'border-red-500' : ''}`}
          placeholder="Masukkan username"
        />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Avatar/Foto Profil</label>
        <div className="mt-1 flex items-center space-x-4">
          <input
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload size={16} className="mr-2" />
            Pilih File
          </label>
          {avatarFile && <span className="text-sm text-gray-600">{avatarFile.name}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nomor HP/WhatsApp</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`input mt-1 ${errors.phone ? 'border-red-500' : ''}`}
          placeholder="08xxxxxxxxxx"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className={`input mt-1 ${errors.gender ? 'border-red-500' : ''}`}
        >
          <option value="">Pilih jenis kelamin</option>
          {GENDER_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Usia</label>
        <input
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          className={`input mt-1 ${errors.age ? 'border-red-500' : ''}`}
          placeholder="Masukkan usia"
          min="13"
          max="100"
        />
        {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
        <AddressForm onAddressChange={handleAddressChange} />
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Pekerjaan</label>
        <select
          name="job"
          value={formData.job}
          onChange={handleChange}
          className={`input mt-1 ${errors.job ? 'border-red-500' : ''}`}
        >
          <option value="">Pilih pekerjaan</option>
          {JOB_OPTIONS.map(job => (
            <option key={job} value={job}>{job}</option>
          ))}
        </select>
        {errors.job && <p className="mt-1 text-sm text-red-600">{errors.job}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Anak Ke-</label>
        <select
          name="childOrder"
          value={formData.childOrder}
          onChange={handleChange}
          className={`input mt-1 ${errors.childOrder ? 'border-red-500' : ''}`}
        >
          <option value="">Pilih urutan anak</option>
          {CHILD_ORDER_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {errors.childOrder && <p className="mt-1 text-sm text-red-600">{errors.childOrder}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative mt-1">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`}
            placeholder="Masukkan password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Metode Pembayaran Utama</label>
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="input mt-1"
        >
          <option value="">Pilih metode pembayaran</option>
          <option value="credit_card">Kartu Kredit</option>
          <option value="bank_transfer">Transfer Bank</option>
          <option value="ewallet">E-Wallet</option>
          <option value="qris">QRIS</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.register')}
          </h2>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 btn btn-secondary"
              >
                Kembali
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 btn btn-primary"
              >
                Lanjut
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Daftar'}
              </button>
            )}
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500">
                {t('auth.login')}
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;