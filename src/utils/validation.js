export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} wajib diisi`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) {
    return 'Email wajib diisi';
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return 'Format email tidak valid';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password wajib diisi';
  }
  if (password.length < 6) {
    return 'Password minimal 6 karakter';
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) {
    return 'Nomor telepon wajib diisi';
  }
  const re = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  if (!re.test(phone)) {
    return 'Format nomor telepon tidak valid';
  }
  return null;
};

export const validateAge = (age) => {
  if (!age) {
    return 'Usia wajib diisi';
  }
  if (age < 13 || age > 100) {
    return 'Usia harus antara 13-100 tahun';
  }
  return null;
};

export const validatePrice = (price) => {
  if (!price) {
    return 'Harga wajib diisi';
  }
  if (price <= 0) {
    return 'Harga harus lebih dari 0';
  }
  return null;
};

export const validateStock = (stock) => {
  if (stock === null || stock === undefined) {
    return 'Stok wajib diisi';
  }
  if (stock < 0) {
    return 'Stok tidak boleh negatif';
  }
  return null;
};