import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Calendar } from 'lucide-react';
import './Sketches.css';

const sketchesData = [
  { id: 1, src: '/assets/sketch-1.png', title: 'Snake & Peony', status: 'free', price: 'от 8 000 ₽' },
  { id: 2, src: '/assets/sketch-2.png', title: 'Delicate Butterfly', status: 'booked', price: 'забронирован' },
  { id: 3, src: '/assets/sketch-3.png', title: 'Geometric Wolf', status: 'free', price: 'от 12 000 ₽' },
  { id: 4, src: '/assets/sketch-4.png', title: 'Gothic Cross', status: 'free', price: 'от 6 000 ₽' },
];

const Sketches = () => {
  const [filter, setFilter] = useState('all'); // all, free, booked

  const filteredSketches = sketchesData.filter(sketch => {
    if (filter === 'all') return true;
    return sketch.status === filter;
  });

  return (
    <section id="sketches" className="sketches section-padding">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="sketches__header"
        >
          <h2 className="section-title">Свободные эскизы</h2>
          <p className="section-subtitle">Рисунки, готовые к реализации</p>
        </motion.div>

        <div className="sketches__filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Все
          </button>
          <button 
            className={`filter-btn ${filter === 'free' ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter('free')}
          >
            Свободные
          </button>
          <button 
            className={`filter-btn ${filter === 'booked' ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter('booked')}
          >
            Занятые
          </button>
        </div>

        <motion.div 
          layout
          className="sketches__grid"
        >
          <AnimatePresence>
            {filteredSketches.map((sketch) => (
              <motion.div
                layout
                key={sketch.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`sketch-card ${sketch.status === 'booked' ? 'sketch-card--booked' : ''}`}
              >
                <div className="sketch-card__image-container">
                  <img src={sketch.src} alt={sketch.title} className="sketch-card__image" />
                  <div className="sketch-card__status-badge">
                    {sketch.status === 'free' ? (
                      <span className="badge badge--free"><Check size={12} /> Свободен</span>
                    ) : (
                      <span className="badge badge--booked"><Lock size={12} /> Забронирован</span>
                    )}
                  </div>
                </div>
                
                <div className="sketch-card__content">
                  <h3 className="sketch-card__title">{sketch.title}</h3>
                  <p className="sketch-card__price">{sketch.price}</p>
                  
                  {sketch.status === 'free' ? (
                    <a href="#booking" className="button button--primary button--sm sketch-card__button">
                      <Calendar size={16} />
                      Забронировать
                    </a>
                  ) : (
                    <button className="button button--outline button--sm sketch-card__button" disabled>
                      Недоступно
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Sketches;
