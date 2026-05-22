import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  X,
  Upload
} from 'lucide-react';
import AdminLoader from '../../components/Admin/AdminLoader';

const PortfolioManager = () => {
  const [works, setWorks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchWorks();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('portfolio_categories')
        .select('*')
        .order('name');
      if (data && Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) setCategory(data[0].name);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchWorks = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (err) {
      console.error('Error fetching works:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload image to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { error: dbError } = await supabase
        .from('portfolio')
        .insert([{
          title,
          category,
          image_url: publicUrl,
          is_featured: isFeatured
        }]);

      if (dbError) throw dbError;

      // Reset form and refresh
      setIsModalOpen(false);
      setTitle('');
      setFile(null);
      setIsFeatured(false);
      fetchWorks();
    } catch (err) {
      alert('Ошибка при загрузке: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (work) => {
    if (!confirm('Вы уверены, что хотите удалить эту работу?')) return;

    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', work.id);

      if (dbError) throw dbError;

      // 2. Extract filename from URL and delete from storage
      // Expected URL: https://.../storage/v1/object/public/media/portfolio/filename.png
      const pathParts = work.image_url.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([`portfolio/${fileName}`]);

      if (storageError) console.error('Storage delete error:', storageError);

      fetchWorks();
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message);
    }
  };

  if (loading) return <AdminLoader message="Загружаем портфолио..." />;

  return (
    <div className="portfolio-manager">
      <div className="dashboard__header">
        <h1 className="section-title" style={{ fontSize: 'var(--type-lg)' }}>Управление портфолио</h1>
        <button className="button button--primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Добавить работу
        </button>
      </div>

      <div className="admin-gallery">
        {works.map((work) => (
          <div key={work.id} className={`admin-gallery__item ${work.is_featured ? 'admin-gallery__item--featured' : ''}`}>
            <img src={work.image_url} alt={work.title} />
            <div className="admin-gallery__overlay">
              <span className="admin-gallery__cat">
                {work.category}
                {work.is_featured && <span className="admin-gallery__featured-tag">★ Крупный</span>}
              </span>
              <button 
                className="admin-gallery__delete" 
                onClick={() => handleDelete(work)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="admin-modal">
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h3>Добавление новой работы</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpload} className="admin-form">
              <div className="form-group">
                <label className="form-label">Заголовок / Описание</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Напр. Реалистичный лев"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Категория</label>
                <select 
                  className="form-input" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.length === 0 && <option value="">Сначала создайте категорию</option>}
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="isFeatured" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Сделать крупным блоком (Bento Featured)
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Изображение</label>
                <div className="file-upload-zone">
                  <input 
                    type="file" 
                    accept="image/*"
                    required
                    onChange={(e) => setFile(e.target.files[0])}
                    id="portfolio-file"
                  />
                  <label htmlFor="portfolio-file">
                    {file ? file.name : (
                      <>
                        <Upload size={24} />
                        <span>Выберите файл или перетащите сюда</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="button button--primary" 
                disabled={uploading}
                style={{ width: '100%', marginTop: '20px' }}
              >
                {uploading ? (
                  <><Loader2 className="animate-spin" size={18} /> Загрузка...</>
                ) : 'Опубликовать работу'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
