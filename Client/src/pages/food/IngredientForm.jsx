import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIngredientById, createIngredient, updateIngredient } from '../../services/foodService';

export default function IngredientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    averagePrice: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getIngredientById(id);
        const i = res.data.data;
        setForm({ name: i.name, averagePrice: i.averagePrice, imageUrl: i.imageUrl || '' });
      } catch {
        setError('Không thể tải nguyên liệu');
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        averagePrice: parseFloat(form.averagePrice) || 0,
        imageUrl: form.imageUrl,
      };
      if (isEdit) {
        await updateIngredient(id, payload);
      } else {
        await createIngredient(payload);
      }
      navigate('/ingredients');
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>{isEdit ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}</h2>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label>Tên</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Giá trung bình</label>
          <input name="averagePrice" type="number" step="0.01" value={form.averagePrice} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>URL hình ảnh</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/ingredients')}>Hủy</button>
        </div>
      </form>
    </div>
  );
}
