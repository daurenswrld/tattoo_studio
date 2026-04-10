import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Calendar, 
  Clock, 
  LogOut, 
  Check, 
  X, 
  RefreshCcw, 
  Search,
  MessageSquare,
  Image as ImageIcon,
  Settings as SettingsIcon,
  LayoutGrid
} from 'lucide-react';
import PortfolioManager from './PortfolioManager';
import SketchesManager from './SketchesManager';
import ScheduleManager from './ScheduleManager';
import './Admin.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, portfolio, sketches, settings
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchBookings();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin');
    } else {
      setUser(user);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      console.error('Error updating status:', err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="loading-screen">Загрузка...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar__header">
            <span className="sidebar__logo">TATTOO STUDIO</span>
            <p style={{ fontSize: 'var(--type-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>Admin Panel</p>
          </div>
          
          <nav className="sidebar__nav">
            <button 
              className={`sidebar__link ${activeTab === 'bookings' ? 'sidebar__link--active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Users size={18} /> Заявки
            </button>
            <button 
              className={`sidebar__link ${activeTab === 'portfolio' ? 'sidebar__link--active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              <ImageIcon size={18} /> Портфолио
            </button>
            <button 
              className={`sidebar__link ${activeTab === 'sketches' ? 'sidebar__link--active' : ''}`}
              onClick={() => setActiveTab('sketches')}
            >
              <LayoutGrid size={18} /> Эскизы
            </button>
            <button 
              className={`sidebar__link ${activeTab === 'settings' ? 'sidebar__link--active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <SettingsIcon size={18} /> Настройки
            </button>
          </nav>

          <button className="sidebar__link" onClick={handleLogout} style={{ marginTop: 'auto', border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <LogOut size={18} /> Выйти
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard__main">
          {activeTab === 'bookings' && (
            <>
              <div className="dashboard__header">
                <h1 className="section-title" style={{ fontSize: 'var(--type-lg)' }}>Управление заявками</h1>
                <div className="dashboard__stats">
                  <span style={{ color: 'var(--color-text-muted)' }}>Всего: {bookings.length}</span>
                </div>
              </div>

          <div className="booking-list">
            {bookings.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '40px' }}>Заявок пока нет</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-card__main">
                    <div className="booking-card__avatar">
                      {booking.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="booking-card__details">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h4>{booking.client_name}</h4>
                        <span className={`status-badge status-badge--${booking.status}`}>
                          {booking.status === 'pending' ? 'Новая' : 
                          booking.status === 'confirmed' ? 'Принята' : 'Отклонена'}
                        </span>
                      </div>
                      
                      <div className="booking-card__meta">
                        <span><MessageSquare size={14} /> {booking.contact}</span>
                        <span><Calendar size={14} /> {new Date(booking.selected_date).toLocaleDateString('ru-RU')}</span>
                        <span><Clock size={14} /> {booking.selected_time}</span>
                      </div>

                      {booking.idea && (
                        <div className="booking-card__idea">
                          {booking.idea}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="booking-card__actions">
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          className="button button--primary button--sm" 
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                        >
                          <Check size={16} /> Принять
                        </button>
                        <button 
                          className="button button--outline button--sm"
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        >
                          <X size={16} /> Отклонить
                        </button>
                      </>
                    )}
                    {booking.status !== 'pending' && (
                      <button 
                        className="button button--outline button--sm"
                        onClick={() => updateBookingStatus(booking.id, 'pending')}
                      >
                        <RefreshCcw size={14} /> Вернуть в обработку
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
            </>
          )}

          {activeTab === 'portfolio' && <PortfolioManager />}
          
          {activeTab === 'sketches' && <SketchesManager />}

          {activeTab === 'settings' && <ScheduleManager />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
