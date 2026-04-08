import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, User, Phone, MessageSquare, Image as ImageIcon } from 'lucide-react';
import Calendar from './Calendar';
import './Booking.css';

const timeSlots = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking submitted:', { selectedDate, selectedTime, ...formData });
    alert('Заявка отправлена! Мастер свяжется с вами в ближайшее время.');
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
                disabled={!selectedDate || !selectedTime}
                className="button button--primary booking__submit"
              >
                <Send size={18} />
                Отправить заявку
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Booking;
