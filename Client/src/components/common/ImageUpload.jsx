import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiLoader, FiX } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';

const compressImageFile = (file, maxDimension = 1000, quality = 0.82) =>
  new Promise((resolve) => {
    if (file.size <= 120 * 1024) {
      resolve(file);
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });

export default function ImageUpload({ value, onChange, label = 'Tải ảnh lên' }) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState('');
  const fileInputRef = useRef(null);
  const dialog = useDialog();

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      dialog.error('Lỗi', 'Chỉ hỗ trợ định dạng PNG, JPG, JPEG, WEBP');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      dialog.error('Lỗi', 'Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    try {
      setUploading(true);
      const optimizedFile = await compressImageFile(file);
      const data = await adminService.uploadImage(optimizedFile);
      if (data && data.url) {
        onChange(data.url);
      } else {
        throw new Error('Không nhận được URL ảnh từ server');
      }
    } catch (error) {
      console.error(error);
      dialog.error('Lỗi', error.message || 'Lỗi khi tải ảnh lên server');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
      setLocalPreview('');
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview('');
    }
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const displaySrc = localPreview || value;

  return (
    <div className="image-upload-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />
      {displaySrc ? (
        <div className="image-upload-preview-container" style={{ position: 'relative' }}>
          <img
            src={displaySrc}
            alt="Preview"
            className="image-upload-preview"
            style={{ opacity: uploading ? 0.65 : 1, transition: 'opacity 0.2s' }}
          />
          {uploading ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(15, 23, 42, 0.35)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '8px',
              }}
            >
              <FiLoader size={18} />
              <span>Đang đồng bộ ảnh...</span>
            </div>
          ) : (
            <button
              type="button"
              className="image-upload-remove-btn"
              onClick={handleRemove}
              title="Xóa ảnh"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className="image-upload-dropzone" onClick={triggerFileInput}>
          <FiUpload className="image-upload-icon" />
          <span className="image-upload-text">{label}</span>
          <span className="image-upload-subtext">Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 5MB)</span>
        </div>
      )}
    </div>
  );
}
