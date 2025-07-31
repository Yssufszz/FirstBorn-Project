import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Play } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { useStorage } from '../../hooks/useStorage';
import { createDocument, updateDocument, deleteDocument } from '../../services/firestore';
import { COLLECTIONS } from '../../utils/constants';
import { formatCurrency, formatDuration } from '../../utils/helpers';
import { validateRequired, validatePrice } from '../../utils/validation';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const ContentManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    isSubscription: false,
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({ audio: null, video: null, thumbnail: null });

  const { documents: content, loading: contentLoading } = useFirestore(COLLECTIONS.CONTENT, [], true);
  const { upload } = useStorage();

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked, files: inputFiles } = e.target;
    
    if (type === 'file' && inputFiles && inputFiles[0]) {
      console.log(`${name} file selected:`, inputFiles[0]);
      setFiles(prev => ({ ...prev, [name]: inputFiles[0] }));
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
    
    const titleError = validateRequired(formData.title, 'Judul');
    if (titleError) newErrors.title = titleError;
    
    const descriptionError = validateRequired(formData.description, 'Deskripsi');
    if (descriptionError) newErrors.description = descriptionError;
    
    const durationError = validateRequired(formData.duration, 'Durasi');
    if (durationError) newErrors.duration = durationError;
    
    if (formData.isSubscription) {
      const priceError = validatePrice(formData.price);
      if (priceError) newErrors.price = priceError;
    }

    const hasExistingAudio = editingContent?.audioUrl;
    const hasExistingVideo = editingContent?.videoUrl;
    const hasNewAudio = files.audio;
    const hasNewVideo = files.video;
    
    const hasAnyMedia = hasExistingAudio || hasExistingVideo || hasNewAudio || hasNewVideo;
    
    if (!hasAnyMedia) {
      newErrors.media = 'Minimal upload satu file audio atau video';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let contentData = {
        ...formData,
        duration: parseInt(formData.duration),
        price: formData.isSubscription ? parseFloat(formData.price) : 0
      };

      console.log('Files to upload:', files);

      if (files.audio) {
        console.log('Uploading audio...');
        contentData.audioUrl = await upload(files.audio, `content/audio/${Date.now()}_${files.audio.name}`);
        console.log('Audio uploaded:', contentData.audioUrl);
      } else if (editingContent?.audioUrl) {
        contentData.audioUrl = editingContent.audioUrl;
      }
      
      if (files.video) {
        console.log('Uploading video...');
        contentData.videoUrl = await upload(files.video, `content/video/${Date.now()}_${files.video.name}`);
        console.log('Video uploaded:', contentData.videoUrl);
      } else if (editingContent?.videoUrl) {
        contentData.videoUrl = editingContent.videoUrl;
      }
      
      if (files.thumbnail) {
        console.log('Uploading thumbnail...');
        contentData.thumbnail = await upload(files.thumbnail, `content/thumbnails/${Date.now()}_${files.thumbnail.name}`);
        console.log('Thumbnail uploaded:', contentData.thumbnail);
      } else if (editingContent?.thumbnail) {
        contentData.thumbnail = editingContent.thumbnail;
      }

      console.log('Final content data:', contentData);

      if (editingContent) {
        await updateDocument(COLLECTIONS.CONTENT, editingContent.id, contentData);
        toast.success('Konten berhasil diperbarui');
      } else {
        await createDocument(COLLECTIONS.CONTENT, contentData);
        toast.success('Konten berhasil ditambahkan');
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Gagal menyimpan konten: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description,
      duration: content.duration.toString(),
      price: content.price.toString(),
      isSubscription: content.isSubscription,
      isActive: content.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (contentId) => {
    if (window.confirm('Yakin ingin menghapus konten ini?')) {
      try {
        await deleteDocument(COLLECTIONS.CONTENT, contentId);
        toast.success('Konten berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus konten');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      price: '',
      isSubscription: false,
      isActive: true
    });
    setFiles({ audio: null, video: null, thumbnail: null });
    setErrors({});
    setEditingContent(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Konten</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Tambah Konten</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari konten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div key={item.id} className="card">
            <div className="relative">
              <img
                src={item.thumbnail || '/api/placeholder/300/200'}
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                {item.isSubscription && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                    Premium
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-xs ${
                  item.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {item.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="absolute top-2 left-2 flex space-x-1">
                {item.audioUrl && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    Audio
                  </span>
                )}
                {item.videoUrl && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Video
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-500">{formatDuration(item.duration)}</span>
                <span className="font-semibold text-primary-600">
                  {item.isSubscription ? formatCurrency(item.price) : 'Gratis'}
                </span>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 btn btn-secondary flex items-center justify-center space-x-1"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
        title={editingContent ? 'Edit Konten' : 'Tambah Konten'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Masukkan judul konten"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`input resize-none ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Masukkan deskripsi konten"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit)</label>
              <input
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                className={`input ${errors.duration ? 'border-red-500' : ''}`}
                placeholder="60"
              />
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                disabled={!formData.isSubscription}
                className={`input ${errors.price ? 'border-red-500' : ''} ${!formData.isSubscription ? 'bg-gray-100' : ''}`}
                placeholder="50000"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                name="isSubscription"
                type="checkbox"
                checked={formData.isSubscription}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Konten Premium (Berlangganan)</span>
            </label>

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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Audio
            </label>
            <input
              name="audio"
              type="file"
              accept="audio/*"
              onChange={handleChange}
              className="input"
            />
            {editingContent?.audioUrl && (
              <p className="text-xs text-gray-500 mt-1">File audio sudah ada. Upload file baru untuk menggantinya.</p>
            )}
            {files.audio && (
              <p className="text-xs text-green-600 mt-1">✓ {files.audio.name} siap diupload</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Video</label>
            <input
              name="video"
              type="file"
              accept="video/*"
              onChange={handleChange}
              className="input"
            />
            {editingContent?.videoUrl && (
              <p className="text-xs text-gray-500 mt-1">File video sudah ada. Upload file baru untuk menggantinya.</p>
            )}
            {files.video && (
              <p className="text-xs text-green-600 mt-1">✓ {files.video.name} siap diupload</p>
            )}
          </div>

          {errors.media && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.media}</p>
              <p className="text-xs text-red-500 mt-1">Upload minimal satu file audio atau video</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
            <input
              name="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="input"
            />
            {editingContent?.thumbnail && (
              <p className="text-xs text-gray-500 mt-1">Thumbnail sudah ada. Upload file baru untuk menggantinya.</p>
            )}
            {files.thumbnail && (
              <p className="text-xs text-green-600 mt-1">✓ {files.thumbnail.name} siap diupload</p>
            )}
          </div>
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
              {loading ? 'Menyimpan...' : (editingContent ? 'Perbarui' : 'Simpan')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContentManagement;