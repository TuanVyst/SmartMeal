import { useState, useRef } from 'react';
import { FiUpload, FiLoader, FiX } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';

export default function ImageUpload({ value, onChange, label = 'Tải ảnh lên' }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dialog = useDialog();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      dialog.error('Lỗi', 'Chỉ hỗ trợ định dạng PNG, JPG, JPEG, WEBP');
      return;
    }

    // Validate size (e.g. 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      dialog.error('Lỗi', 'Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);
      const data = await adminService.uploadImage(file);
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
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (uploading) {
    return (
      <div className="image-upload-loading">
        <FiLoader size={24} />
        <span>Đang tải ảnh lên...</span>
      </div>
    );
  }

  return (
    <div className="image-upload-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />
      {value ? (
        <div className="image-upload-preview-container">
          <img src={value} alt="Preview" className="image-upload-preview" />
          <button
            type="button"
            className="image-upload-remove-btn"
            onClick={handleRemove}
            title="Xóa ảnh"
          >
            <FiX size={16} />
          </button>
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
