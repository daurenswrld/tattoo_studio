import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, User, Phone, MessageSquare, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sendTelegramMessage } from '../../lib/telegram';
import Calendar from './Calendar';
import './Booking.css';

const timeSlots = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idea: '',
    files: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            client_name: formData.name,
            contact: formData.phone,
            idea: formData.idea,
            selected_date: selectedDate.toISOString().split('T')[0],
            selected_time: selectedTime,
            status: 'pending'
          }
        ])
        .select();

      if (error) throw error;

      // Send notification to Telegram
      const formattedDate = selectedDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Almaty'
      });

      const message = `
🔥 <b>Новая заявка на сеанс!</b>

👤 <b>Имя:</b> ${formData.name}
📞 <b>Контакт:</b> ${formData.phone}
📅 <b>Дата:</b> ${formattedDate}
⏰ <b>Время:</b> ${selectedTime}

📝 <b>Идея:</b>
${formData.idea || 'Не указана'}

<i>Проверьте админ-панель для обработки заявки.</i>
      `;
      
      await sendTelegramMessage(message);

      setIsSuccess(true);
      setFormData({ name: '', phone: '', idea: '', files: null });
      setSelectedDate(null);
      setSelectedTime('');
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз или свяжитесь с мастером напрямую.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="booking section-padding">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="booking__header"
        >
          <h2 className="section-title">Записаться на сеанс</h2>
          <p className="section-subtitle">Выберите время и расскажите о своей идее</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="booking__content"
        >
          <div className="booking__selector">
            <div className="booking__step">
              <h3 className="booking__step-title">1. Выберите дату</h3>
              <Calendar 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate} 
              />
            </div>

            {selectedDate && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="booking__step"
              >
                <h3 className="booking__step-title">2. Выберите время</h3>
                <div className="booking__time-grid">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`time-slot ${selectedTime === time ? 'time-slot--selected' : ''}`}
                    >
                      <Clock size={14} />
                      {time}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="booking__form-container">
            <h3 className="booking__step-title">3. Информация о вас</h3>
            
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="booking__success"
              >
                <CheckCircle size={64} color="var(--color-success)" />
                <h4 className="booking__success-title">Заявка отправлена!</h4>
                <p className="booking__success-text">
                  Мастер получил ваше сообщение и свяжется с вами в ближайшее время для подтверждения сеанса.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="button button--outline"
                >
                  Отправить еще одну
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                  <label className="form-label"><User size={14} /> Ваше имя</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Как к вам обращаться?"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label"><Phone size={14} /> Телефон</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+7 (___) ___-__-__"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label"><MessageSquare size={14} /> Ваша идея</label>
                  <textarea
                    name="idea"
                    placeholder="Размер, местоположение на теле, описание..."
                    rows="4"
                    value={formData.idea}
                    onChange={handleInputChange}
                    className="form-input"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label"><ImageIcon size={14} /> Референсы (опционально)</label>
                  <input
                    type="file"
                    onChange={(e) => setFormData(prev => ({ ...prev, files: e.target.files }))}
                    className="form-input form-input--file"
                    multiple
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={!selectedDate || !selectedTime || isSubmitting}
                  className="button button--primary booking__submit"
                >
                  {isSubmitting ? 'Отправка...' : (
                    <>
                      <Send size={18} />
                      Отправить заявку
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Booking;
