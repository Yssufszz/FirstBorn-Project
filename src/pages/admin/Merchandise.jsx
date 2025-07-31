import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { useStorage } from '../../hooks/useStorage';
import { createDocument, updateDocument, deleteDocument } from '../../services/firestore';
import { COLLECTIONS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { validateRequired, validatePrice, validateStock } from '../../utils/validation';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const Merchandise = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  const { documents: merchandise, loading: merchandiseLoading } = useFirestore(COLLECTIONS.MERCHANDISE, [], true);
  const { upload } = useStorage();

  const filteredMerchandise = merchandise.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (name === 'images' && files) {
      setImageFiles(Array.from(files));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateRequired(formData.name, 'Nama produk');
    if (nameError) newErrors.name = nameError;
    
    const descriptionError = validateRequired(formData.description, 'Deskripsi');
    if (descriptionError) newErrors.description = descriptionError;
    
    const priceError = validatePrice(formData.price);
    if (priceError) newErrors.price = priceError;
    
    const stockError = validateStock(formData.stock);
    if (stockError) newErrors.stock = stockError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock)
      };

      if (imageFiles.length > 0) {
        const imageUrls = await Promise.all(
          imageFiles.map(file => 
            upload(file, `merchandise/${Date.now()}_${file.name}`)
          )
        );
        productData.images = imageUrls;
      }

      if (editingProduct) {
        await updateDocument(COLLECTIONS.MERCHANDISE, editingProduct.id, productData);
        toast.success('Produk berhasil diperbarui');
      } else {
        await createDocument(COLLECTIONS.MERCHANDISE, productData);
        toast.success('Produk berhasil ditambahkan');
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      toast.error('Gagal menyimpan produk: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount?.toString() || '',
      stock: product.stock.toString(),
      isActive: product.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await deleteDocument(COLLECTIONS.MERCHANDISE, productId);
        toast.success('Produk berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus produk');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '',
      stock: '',
      isActive: true
    });
    setImageFiles([]);
    setErrors({});
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Merchandise</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Tambah Produk</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari merchandise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMerchandise.map((product) => (
          <div key={product.id} className="card">
            <div className="relative">
              <img
                src={product.images?.[0] || '/api/placeholder/300/300'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex flex-col space-y-1">
                {product.discount > 0 && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                    -{product.discount}%
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-xs ${
                  product.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {product.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between mt-3">
                <div>
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(product.price)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-xs text-gray-500 line-through ml-1">
                      {formatCurrency(product.price / (1 - product.discount / 100))}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Package size={14} className="mr-1" />
                  <span>{product.stock}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 btn btn-secondary flex items-center justify-center space-x-1"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center space-x-1"
                >
                  <Trash2 size={14} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Masukkan nama produk"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`input resize-none ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Masukkan deskripsi produk"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className={`input ${errors.price ? 'border-red-500' : ''}`}
                placeholder="50000"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diskon (%)</label>
              <input
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleChange}
                className="input"
                placeholder="10"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
            <input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              className={`input ${errors.stock ? 'border-red-500' : ''}`}
              placeholder="100"
              min="0"
            />
            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
          </div>

          <div>
            <label className="flex items-center">
              <input
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Aktif</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
            <input
              name="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleChange}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">Pilih beberapa gambar untuk produk</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : (editingProduct ? 'Perbarui' : 'Simpan')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Merchandise;