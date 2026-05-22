import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  X, 
  Tag,
  LayoutGrid,
  ImageIcon
} from 'lucide-react';
import AdminLoader from '../../components/Admin/AdminLoader';

const CategoryManager = () => {
  const [portfolioCats, setPortfolioCats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New category inputs
  const [newPortfolioCat, setNewPortfolioCat] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data: pCats } = await supabase
        .from('portfolio_categories')
        .select('*')
        .order('name');
      
      setPortfolioCats(pCats || []);
    } catch (err) {
      console.error('Error fetching categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newPortfolioCat.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('portfolio_categories')
        .insert([{ name: newPortfolioCat.trim() }]);

      if (error) throw error;
      setNewPortfolioCat('');
      fetchCategories();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Вы уверены? Это может повлиять на отображение работ с этой категорией.')) return;

    try {
      const { error } = await supabase
        .from('portfolio_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  if (loading) return <AdminLoader message="Загружаем категории..." />;

  return (
    <div className="category-manager">
      <div className="dashboard__header">
        <h1 className="section-title" style={{ fontSize: 'var(--type-lg)' }}>Управление категориями</h1>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {/* Portfolio Categories */}
        <div className="category-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ImageIcon size={20} />
            <h3 style={{ fontSize: 'var(--type-md)' }}>Категории Портфолио</h3>
          </div>
          
          <div className="admin-form" style={{ marginBottom: '24px', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Напр. Реализм"
              value={newPortfolioCat}
              onChange={(e) => setNewPortfolioCat(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <button 
              className="button button--primary" 
              onClick={() => addCategory()}
              disabled={submitting || !newPortfolioCat}
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="booking-list">
            {portfolioCats.length === 0 ? (
              <p className="admin-placeholder" style={{ padding: '20px' }}>Нет категорий</p>
            ) : (
              portfolioCats.map((cat) => (
                <div key={cat.id} className="booking-card" style={{ padding: '12px 20px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Tag size={14} color="var(--color-text-muted)" />
                    <span style={{ fontWeight: '500' }}>{cat.name}</span>
                  </div>
                  <button className="admin-gallery__delete" onClick={() => deleteCategory(cat.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
