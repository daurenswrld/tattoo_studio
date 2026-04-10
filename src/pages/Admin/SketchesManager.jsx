import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  X,
  Upload,
  CheckCircle,
  Clock
} from 'lucide-react';

const SketchesManager = () => {
  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSketches();
  }, []);

  const fetchSketches = async () => {
    try {
      const { data, error } = await supabase
        .from('sketches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSketches(data || []);
    } catch (err) {
      console.error('Error fetching sketches:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `sketches/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // 3. DB
      const { error: dbError } = await supabase
        .from('sketches')
        .insert([{
          title,
          price,
          image_url: publicUrl,
          status: 'free'
        }]);

      if (dbError) throw dbError;

      setIsModalOpen(false);
      setTitle('');
      setPrice('');
      setFile(null);
      fetchSketches();
    } catch (err) {
      alert('Ошибка при загрузке: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleStatus = async (sketch) => {
    const newStatus = sketch.status === 'free' ? 'booked' : 'free';
    const newPrice = newStatus === 'booked' ? 'забронирован' : 'от 5 000 ₸'; // Default if free, or we can ask
    
    try {
      const { error } = await supabase
        .from('sketches')
        .update({ status: newStatus, price: newStatus === 'booked' ? 'забронирован' : sketch.price.replace('₽', '₸') })
        .eq('id', sketch.id);

      if (error) throw error;
      fetchSketches();
    } catch (err) {
      alert('Ошибка при обновлении статуса');
    }
  };

  const handleDelete = async (sketch) => {
    if (!confirm('Удалить этот эскиз?')) return;

    try {
      await supabase.from('sketches').delete().eq('id', sketch.id);
      
      const pathParts = sketch.image_url.split('/');
      const fileName = pathParts[pathParts.length - 1];
      await supabase.storage.from('media').remove([`sketches/${fileName}`]);

      fetchSketches();
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  if (loading) return <div>Загрузка эскизов...</div>;

  return (
    <div className="sketches-manager">
      <div className="dashboard__header">
        <h1 className="section-title" style={{ fontSize: 'var(--type-lg)' }}>Витрина эскизов</h1>
        <button className="button button--primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Добавить эскиз
        </button>
      </div>

      <div className="admin-gallery">
        {sketches.map((sketch) => (
          <div key={sketch.id} className="admin-gallery__item">
            <img src={sketch.image_url} alt={sketch.title} />
            <div className="admin-gallery__overlay" style={{ opacity: 1, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <span className={`status-badge status-badge--${sketch.status}`} style={{ fontSize: '8px' }}>
                  {sketch.status === 'free' ? 'Свободен' : 'Занят'}
                </span>
                <button 
                  className="admin-gallery__delete" 
                  onClick={() => handleDelete(sketch)}
                  style={{ width: '24px', height: '24px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                <p style={{ fontSize: '12px', fontWeight: '600' }}>{sketch.price}</p>
                <button 
                  onClick={() => toggleStatus(sketch)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                  title="Сменить статус"
                >
                  {sketch.status === 'free' ? <CheckCircle size={18} /> : <Clock size={18} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="admin-modal">
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h3>Новый эскиз</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpload} className="admin-form">
              <div className="form-group">
                <label className="form-label">Название эскиза</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Цена (напр. от 5 000 ₸)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[₽Ppр]/g, '₸'))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Изображение эскиза</label>
                <div className="file-upload-zone">
                  <input 
                    type="file" 
                    accept="image/*"
                    required
                    onChange={(e) => setFile(e.target.files[0])}
                    id="sketch-file"
                  />
                  <label htmlFor="sketch-file">
                    {file ? file.name : (
                      <>
                        <Upload size={24} />
                        <span>Выберите файл</span>
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
                {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Добавить на сайт'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SketchesManager;
