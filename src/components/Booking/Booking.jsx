import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Clock, User, Phone, MessageSquare, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sendTelegramMessage, sendTelegramPhoto } from '../../lib/telegram';
import Calendar from './Calendar';
import './Booking.css';

const timeSlots = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Booking = ({ initialSketch }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idea: '',
    files: null,
    sketch: null
  });

  React.useEffect(() => {
    if (initialSketch) {
      setFormData(prev => ({ ...prev, sketch: initialSketch }));
    }
  }, [initialSketch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    try {
      const insertPromise = supabase
        .from('bookings')
        .insert([
          {
            client_name: formData.name,
            contact: formData.phone,
            idea: formData.idea,
            sketch_id: formData.sketch?.id || null,
            selected_date: selectedDate.toISOString().split('T')[0],
            selected_time: selectedTime,
            status: 'pending'
          }
        ])
        .select();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Превышено время ожидания сервера (тайм-аут).')), 8000)
      );

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

      if (error) throw error;

      // Send notification to Telegram
      const formattedDate = selectedDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Almaty'
      });

      const sketchInfo = formData.sketch 
        ? `\n🎨 <b>Эскиз:</b> ${formData.sketch.title}\n` 
        : '';

      const message = `
🔥 <b>Новая заявка на сеанс!</b>

👤 <b>Имя:</b> ${formData.name}
📞 <b>Контакт:</b> ${formData.phone}
📅 <b>Дата:</b> ${formattedDate}
⏰ <b>Время:</b> ${selectedTime}
${sketchInfo}
📝 <b>Идея:</b>
${formData.idea || 'Не указана'}

<i>Проверьте админ-панель для обработки заявки.</i>
      `;
      
      // If user uploaded files, send the first one with the caption, and the rest without
      if (formData.files && formData.files.length > 0) {
        // Send the first image with the detailed caption
        await sendTelegramPhoto(formData.files[0], message);
        
        // If there are more images, send them without caption to not duplicate text
        for (let i = 1; i < formData.files.length; i++) {
          await sendTelegramPhoto(formData.files[i], '');
        }
      } else {
        // Fallback to text message if no files uploaded
        await sendTelegramMessage(message);
      }

      setIsSuccess(true);
      setFormData({ name: '', phone: '', idea: '', files: null });
      setSelectedDate(null);
      setSelectedTime('');
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert(error.message === 'Превышено время ожидания сервера (тайм-аут).' 
        ? error.message + ' Проверьте подключение или статус базы данных.' 
        : 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз или свяжитесь с мастером напрямую.');
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
          {/* Progress Indicator */}
          <div className="booking__progress">
            {[1, 2, 3].map(step => (
              <div 
                key={step} 
                className={`progress-step ${currentStep >= step ? 'progress-step--active' : ''} ${currentStep === step ? 'progress-step--current' : ''}`}
              >
                <div className="progress-step__number">{step}</div>
                <span className="progress-step__label">
                  {step === 1 ? 'Дата' : step === 2 ? 'Время' : 'Детали'}
                </span>
              </div>
            ))}
          </div>

          <div className="booking__step-container">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="booking__step"
                >
                  <h3 className="booking__step-title">1. Выберите дату сеанса</h3>
                  <Calendar 
                    selectedDate={selectedDate} 
                    onDateSelect={(date) => {
                      setSelectedDate(date);
                      setCurrentStep(2);
                    }} 
                  />
                  <p className="booking__hint">* Выходные и прошедшие даты недоступны для записи</p>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="booking__step"
                >
                  <h3 className="booking__step-title">2. Выберите время сеанса</h3>
                  <div className="booking__time-grid">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setCurrentStep(3);
                        }}
                        className={`time-slot ${selectedTime === time ? 'time-slot--selected' : ''}`}
                      >
                        <Clock size={14} />
                        {time}
                      </button>
                    ))}
                  </div>
                  <div className="booking__step-nav">
                    <button onClick={() => setCurrentStep(1)} className="button button--outline">
                      Назад к дате
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="booking__step"
                >
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
                        onClick={() => {
                          setIsSuccess(false);
                          setCurrentStep(1);
                          setSelectedDate(null);
                          setSelectedTime('');
                        }}
                        className="button button--outline"
                      >
                        Отправить еще одну
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="booking-form">
                      <div className="form-row">
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
                          <label className="form-label"><Phone size={14} /> Телефон / Telegram</label>
                          <input
                            type="text"
                            name="phone"
                            placeholder="+7 (___) ___-__-__ или @username"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label"><MessageSquare size={14} /> Описание идеи</label>
                        <textarea
                          name="idea"
                          placeholder="Расскажите о татуировке: место, примерный размер, пожелания..."
                          rows="4"
                          value={formData.idea}
                          onChange={handleInputChange}
                          className="form-input"
                        ></textarea>
                      </div>

                      {formData.sketch ? (
                        <div className="form-group">
                          <label className="form-label"><ImageIcon size={14} /> Выбранный эскиз</label>
                        <div className="selected-sketch-preview">
                          <img src={formData.sketch.src || formData.sketch.image_url} alt="Selected sketch" />
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, sketch: null }))} className="remove-sketch">Удалить</button>
                          </div>
                        </div>
                      ) : (
                        <div className="form-group">
                          <label className="form-label"><ImageIcon size={14} /> Референсы или свой эскиз</label>
                          <input
                            type="file"
                            onChange={(e) => setFormData(prev => ({ ...prev, files: e.target.files }))}
                            className="form-input form-input--file"
                            multiple
                          />
                        </div>
                      )}

                      <div className="booking__step-nav">
                        <button type="button" onClick={() => setCurrentStep(2)} className="button button--outline">
                          Назад к времени
                        </button>
                        <button 
                          type="submit" 
                          disabled={!selectedDate || !selectedTime || isSubmitting}
                          className="button button--primary booking__submit"
                        >
                          {isSubmitting ? 'Отправка...' : (
                            <>
                              <Send size={18} />
                              Подтвердить запись
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Booking;
