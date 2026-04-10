import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, Trash2, Loader2, Plus } from 'lucide-react';
import Calendar from '../../components/Booking/Calendar';
import { format } from 'date-fns';

const ScheduleManager = () => {
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setBlockedDates(data || []);
    } catch (err) {
      console.error('Error fetching blocked dates:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDate = async () => {
    if (!selectedDate) return;
    
    setAdding(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      const { error } = await supabase
        .from('blocked_dates')
        .insert([{ date: dateStr }]);

      if (error) {
        if (error.code === '23505') {
          alert('Эта дата уже заблокирована');
        } else {
          throw error;
        }
      } else {
        fetchBlockedDates();
        setSelectedDate(null);
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleUnblockDate = async (id) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchBlockedDates();
    } catch (err) {
      alert('Ошибка при разблокировке');
    }
  };

  if (loading) return <div>Загрузка графика...</div>;

  return (
    <div className="schedule-manager">
      <div className="dashboard__header">
        <h1 className="section-title" style={{ fontSize: 'var(--type-lg)' }}>Настройки графика</h1>
      </div>

      <div className="schedule-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Calendar Picker */}
        <div className="schedule-picker">
          <h3 style={{ marginBottom: '20px', fontSize: 'var(--type-md)' }}>Выберите дату для блокировки</h3>
          <Calendar 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
          />
          <button 
            className="button button--primary" 
            style={{ width: '100%', marginTop: '20px' }}
            disabled={!selectedDate || adding}
            onClick={handleBlockDate}
          >
            {adding ? <Loader2 className="animate-spin" size={18} /> : (
              <><CalendarIcon size={18} /> Отметить как выходной</>
            )}
          </button>
        </div>

        {/* Blocked List */}
        <div className="schedule-list">
          <h3 style={{ marginBottom: '20px', fontSize: 'var(--type-md)' }}>Заблокированные даты (Выходные)</h3>
          <div className="booking-list">
            {blockedDates.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Нет заблокированных дат</p>
            ) : (
              blockedDates.map((item) => (
                <div key={item.id} className="booking-card" style={{ padding: '12px 20px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <CalendarIcon size={18} color="var(--color-accent)" />
                    <span style={{ fontSize: 'var(--type-sm)', fontWeight: '600' }}>
                      {new Date(item.date).toLocaleDateString('ru-RU', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        timeZone: 'Asia/Almaty'
                      })}
                    </span>
                  </div>
                  <button 
                    className="admin-gallery__delete" 
                    onClick={() => handleUnblockDate(item.id)}
                    style={{ position: 'relative', opacity: 1 }}
                  >
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

export default ScheduleManager;
