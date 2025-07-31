export const COLLECTIONS = {
  USERS: 'users',
  CONTENT: 'content',
  MERCHANDISE: 'merchandise',
  ORDERS: 'orders',
  DISCUSSIONS: 'discussions',
  MESSAGES: 'messages',
  SUBSCRIPTIONS: 'subscriptions'
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

export const SHIPPING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  RETURNED: 'returned'
};

export const MESSAGE_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  REPLIED: 'replied'
};

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Pria' },
  { value: 'female', label: 'Wanita' },
  { value: 'prefer_not_to_say', label: 'Tidak ingin menyebutkan' }
];

export const JOB_OPTIONS = [
  'Pelajar/Mahasiswa',
  'Pegawai Swasta',
  'PNS/ASN',
  'TNI/Polri',
  'Wirausaha',
  'Freelancer',
  'Ibu Rumah Tangga',
  'Lainnya'
];

export const CHILD_ORDER_OPTIONS = [
  { value: 1, label: 'Anak Pertama' },
  { value: 2, label: 'Anak Kedua' },
  { value: 3, label: 'Anak Ketiga' },
  { value: 4, label: 'Anak Keempat' },
  { value: 5, label: 'Anak Kelima atau lebih' }
];