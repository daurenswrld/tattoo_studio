import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Trash2,
  Image as ImageIcon,
  Settings as SettingsIcon,
  LayoutGrid,
  Tag,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import PortfolioManager from './PortfolioManager';
import SketchesManager from './SketchesManager';
import ScheduleManager from './ScheduleManager';
import CategoryManager from './CategoryManager';
import AdminLoader from '../../components/Admin/AdminLoader';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, portfolio, sketches, categories, settings
  const [bookingFilter, setBookingFilter] = useState('pending');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, sketches: 0 });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
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
      
      // Fetch other stats
      const { count: sketchCount } = await supabase.from('sketches').select('*', { count: 'exact', head: true });
      setStats(prev => ({
        ...prev,
        total: data?.length || 0,
        pending: data?.filter(b => b.status === 'pending').length || 0,
        sketches: sketchCount || 0
      }));
    } catch (err) {
      console.error('Error fetching bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Real-time listener for new bookings
    const bookingsSubscription = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: '*', table: 'bookings' }, (payload) => {
        console.log('Real-time update received:', payload);
        fetchBookings(); // Refresh everything on any change
        if (payload.eventType === 'INSERT') {
          showToast('Новая заявка поступила!');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
    };
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Нет доступа. RLS блокирует изменение.");
      
      // Update local state
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      showToast(`Заявка ${status === 'confirmed' ? 'принята' : 'отклонена'}`);
    } catch (err) {
      console.error('Error updating status:', err.message);
      alert('Ошибка обновления статуса: ' + err.message + '\n\nПроверьте RLS политики в Supabase (UPDATE).');
    }
  };

  const deleteBooking = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку навсегда?')) return;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Нет доступа. RLS блокирует удаление.");
      
      setBookings(prev => prev.filter(b => b.id !== id));
      showToast('Заявка удалена');
    } catch (err) {
      console.error('Error deleting booking:', err.message);
      alert('Ошибка удаления: ' + err.message + '\n\nВозможно, в базе данных не добавлена RLS политика на DELETE для таблицы bookings.');
    }
  };

  const handleReschedule = async (id) => {
    if (!newDate || !newTime) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          selected_date: newDate, 
          selected_time: newTime,
          status: 'rescheduled' 
        })
        .eq('id', id);

      if (error) throw error;
      
      setBookings(prev => prev.map(b => b.id === id ? { ...b, selected_date: newDate, selected_time: newTime, status: 'rescheduled' } : b));
      setReschedulingId(null);
      setNewDate('');
      setNewTime('');
      showToast('Заявка перенесена');
    } catch (err) {
      console.error('Error rescheduling:', err.message);
      alert('Ошибка переноса: ' + err.message);
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <AdminLoader message="Вход в систему..." />;

  return (
    <div className="dashboard">
      <div className={`dashboard__container ${isCollapsed ? 'dashboard__container--collapsed' : ''}`}>
        {/* Sidebar */}
        <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
          <div className="sidebar__header">
            <div className="sidebar__logo-wrap">
              <span className="sidebar__logo">{isCollapsed ? "TS" : "TATTOO STUDIO"}</span>
              {!isCollapsed && (
                <p className="sidebar__subtitle" style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px', letterSpacing: '0.1em' }}>
                  Admin Panel
                </p>
              )}
            </div>
            <button 
              className="sidebar__toggle" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Развернуть" : "Свернуть"}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          
          <nav className="sidebar__nav">
            <button 
              className={`sidebar__link ${activeTab === 'bookings' ? 'sidebar__link--active' : ''}`}
              onClick={() => setActiveTab('bookings')}
              title="Заявки"
            >
              <Users size={18} /> <span>Заявки</span>
            </button>
            <button 
              className={`sidebar__link ${activeTab === 'portfolio' ? 'sidebar__link--active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
              title="Портфолио"
            >
              <ImageIcon size={18} /> <span>Портфолио</span>
            </button>
            <button 
              className={`sidebar__link ${activeTab === 'sketches' ? 'sidebar__link--active' : ''}`}
              onClick={() => setActiveTab('sketches')}
              title="Эскизы"
            >
              <LayoutGrid size={18} /> <span>Эскизы</span>
            </button>
            <button 
              className={`sidebar__link ${activeTab === 'categories' ? 'sidebar__link--active' : ''}`}
              onClick={() => setActiveTab('categories')}
              title="Категории"
            >
              <Tag size={18} /> <span>Категории</span>
            </button>
            <button 
              className={`sidebar__link ${activeTab === 'settings' ? 'sidebar__link--active' : ''}`}
              onClick={() => setActiveTab('settings')}
              title="Настройки"
            >
              <SettingsIcon size={18} /> <span>Настройки</span>
            </button>
          </nav>

          <button 
            className="sidebar__link" 
            onClick={handleLogout} 
            style={{ marginTop: 'auto', border: 'none', background: 'none', cursor: 'pointer', width: 'auto', textAlign: 'left' }}
            title="Выйти"
          >
            <LogOut size={18} /> <span>Выйти</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard__main">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === 'bookings' && (
                <>
                  <div className="dashboard__header">
                    <div>
                      <h1 className="section-title" style={{ textAlign: 'left', fontSize: 'var(--type-xl)', marginBottom: '4px' }}>Рабочее пространство</h1>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--type-xs)' }}>Добро пожаловать в панель управления студией</p>
                    </div>
                  </div>

                  {/* Dynamic Filtering Logic */}
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const isPastBooking = (dateStr) => {
                      const d = new Date(dateStr);
                      d.setHours(0, 0, 0, 0);
                      return d.getTime() < today.getTime();
                    };

                    const pendingBookings = bookings.filter(b => (b.status === 'pending' || b.status === 'rescheduled') && !isPastBooking(b.selected_date));
                    const upcomingBookings = bookings.filter(b => b.status === 'confirmed' && !isPastBooking(b.selected_date));
                    const archiveBookings = bookings.filter(b => b.status === 'cancelled' || isPastBooking(b.selected_date));

                    let displayedBookings = [];
                    if (bookingFilter === 'pending') displayedBookings = pendingBookings;
                    else if (bookingFilter === 'upcoming') displayedBookings = upcomingBookings;
                    else if (bookingFilter === 'archive') displayedBookings = archiveBookings;
                    else displayedBookings = pendingBookings; // fallback

                    return (
                      <>
                        {/* Stats Bar */}
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                          <div className="stats-card">
                            <span className="stats-card__label">Новые заявки</span>
                            <span className="stats-card__value">{pendingBookings.length}</span>
                          </div>
                          <div className="stats-card">
                            <span className="stats-card__label">Ожидают сеанса</span>
                            <span className="stats-card__value">{upcomingBookings.length}</span>
                          </div>
                          <div className="stats-card">
                            <span className="stats-card__label">В архиве</span>
                            <span className="stats-card__value">{archiveBookings.length}</span>
                          </div>
                        </div>

                        <div className="dashboard__filters" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                          <button 
                            className={`button button--sm ${bookingFilter === 'pending' ? 'button--primary' : 'button--outline'}`}
                            onClick={() => setBookingFilter('pending')}
                          >
                            Новые ({pendingBookings.length})
                          </button>
                          <button 
                            className={`button button--sm ${bookingFilter === 'upcoming' ? 'button--primary' : 'button--outline'}`}
                            onClick={() => setBookingFilter('upcoming')}
                          >
                            Предстоящие ({upcomingBookings.length})
                          </button>
                          <button 
                            className={`button button--sm ${bookingFilter === 'archive' ? 'button--primary' : 'button--outline'}`}
                            onClick={() => setBookingFilter('archive')}
                          >
                            Архив ({archiveBookings.length})
                          </button>
                        </div>

                        <div className="booking-list">
                          {displayedBookings.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '40px' }}>В этой категории пока ничего нет</p>
                          ) : (
                            displayedBookings.map((booking) => (
                        <div key={booking.id} className="booking-card" style={{ opacity: booking.status !== 'pending' ? 0.7 : 1 }}>
                          <div className="booking-card__header">
                            <div className="booking-card__datetime">
                              <div className="booking-card__date-box">
                                <span className="booking-card__month">{new Date(booking.selected_date).toLocaleString('ru-RU', { month: 'short' })}</span>
                                <span className="booking-card__day">{new Date(booking.selected_date).getDate()}</span>
                              </div>
                              <div className="booking-card__time-box">
                                <Clock size={16} />
                                <span>{booking.selected_time}</span>
                              </div>
                            </div>
                            <span className={`status-badge status-badge--${booking.status}`}>
                              {booking.status === 'pending' ? 'Новая' : 
                              booking.status === 'confirmed' ? 'Принята' : 
                              booking.status === 'rescheduled' ? 'Перенесена' : 'Отклонена'}
                            </span>
                          </div>

                          <div className="booking-card__body">
                            <div className="booking-card__client">
                              <div className="booking-card__avatar">
                                {booking.client_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="booking-card__client-info">
                                <h4>{booking.client_name}</h4>
                                <a href={booking.contact.includes('@') ? `https://t.me/${booking.contact.replace('@', '')}` : `tel:${booking.contact}`} target="_blank" rel="noreferrer" className="booking-card__contact">
                                  <MessageSquare size={14} /> {booking.contact}
                                </a>
                              </div>
                            </div>

                            {booking.idea && (
                              <div className="booking-card__idea">
                                <span className="booking-card__idea-label">Описание идеи:</span>
                                <p>{booking.idea}</p>
                              </div>
                            )}
                          </div>

                          <div className="booking-card__footer">
                            <div className="booking-card__created">
                              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Оформлена: {new Date(booking.created_at).toLocaleString('ru-RU')}</span>
                            </div>
                            <div className="booking-card__actions">
                              {(booking.status === 'pending' || booking.status === 'rescheduled') ? (
                                <>
                                  <button 
                                    className="button button--primary button--sm" 
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                    style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)', color: '#000' }}
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
                              ) : (
                                <button 
                                  className="button button--outline button--sm"
                                  onClick={() => deleteBooking(booking.id)}
                                  style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                                  title="Удалить из базы"
                                >
                                  <Trash2 size={16} /> Удалить
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            })()}
            </>
          )}

              {activeTab === 'portfolio' && <PortfolioManager />}
              {activeTab === 'sketches' && <SketchesManager />}
              {activeTab === 'categories' && <CategoryManager />}
              {activeTab === 'settings' && <ScheduleManager />}
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="admin-toast"
            >
              <Check size={16} /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
