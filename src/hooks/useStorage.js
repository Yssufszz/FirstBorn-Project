import { useState } from 'react';
import { uploadFile, deleteFile } from '../services/storage';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file, path) => {
    setUploading(true);
    setProgress(0);
    
    try {
      const url = await uploadFile(file, path);
      setProgress(100);
      return url;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const remove = async (path) => {
    try {
      await deleteFile(path);
    } catch (error) {
      throw error;
    }
  };

  return { upload, remove, uploading, progress };
};