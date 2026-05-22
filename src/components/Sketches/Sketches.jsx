import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Sketches.css';

const DEFAULT_SKETCHES = [
  { id: 1, src: '/assets/sketch-1.png', title: 'Snake & Peony', status: 'free', price: 'от 8 000 ₽' },
  { id: 2, src: '/assets/sketch-2.png', title: 'Delicate Butterfly', status: 'booked', price: 'забронирован' },
  { id: 3, src: '/assets/sketch-3.png', title: 'Geometric Wolf', status: 'free', price: 'от 12 000 ₽' },
  { id: 4, src: '/assets/sketch-4.png', title: 'Gothic Cross', status: 'free', price: 'от 6 000 ₽' },
];

const Sketches = ({ onSelectSketch }) => {
  const [sketches, setSketches] = useState(DEFAULT_SKETCHES);
  const [filter, setFilter] = useState('all');
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const sliderRef = React.useRef(null);
  const containerRef = React.useRef(null);

  useEffect(() => {
    fetchSketches();
  }, []);

  useEffect(() => {
    const updateConstraints = () => {
      if (sliderRef.current && containerRef.current) {
        const sliderWidth = sliderRef.current.scrollWidth;
        const containerWidth = containerRef.current.offsetWidth;
        setConstraints({ 
          left: -(sliderWidth - containerWidth + 32), // 32 is padding
          right: 0 
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [sketches, filter]);

  const fetchSketches = async () => {
    try {
      const { data, error } = await supabase
        .from('sketches')
        .select('*')
        .order('id', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedData = data.map(item => ({
          id: item.id,
          src: item.image_url,
          title: item.title,
          status: item.status,
          price: item.price,
          category: item.category_name
        }));
        setSketches(formattedData);
      }
    } catch (err) {
      console.error('Error fetching sketches:', err);
      // Keep DEFAULT_SKETCHES on error
    }
  };

  const filteredSketches = sketches.filter(sketch => {
    return filter === 'all' || sketch.status === filter;
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
      </div>

      <div className="sketches__slider-container" ref={containerRef}>
        <motion.div 
          ref={sliderRef}
          drag="x"
          dragConstraints={constraints}
          className="sketches__slider"
        >
          <AnimatePresence mode="popLayout">
            {filteredSketches.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sketches__empty"
              >
                <div className="empty-content">
                  <span className="empty-icon">✦</span>
                  <p>Чистое полотно для твоей идеи</p>
                  <small style={{ opacity: 0.5, fontSize: '12px', marginTop: '8px', display: 'block' }}>
                    Следите за обновлениями, новые эскизы уже в пути
                  </small>
                </div>
              </motion.div>
            ) : (
              filteredSketches.map((sketch) => (
                <motion.div
                  layout
                  key={sketch.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
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
                    <p className="sketch-card__price">{sketch.price.replace(/[₽Pр\.]/g, '₸')}</p>
                    
                    {sketch.status === 'free' ? (
                      <button 
                        onClick={() => onSelectSketch && onSelectSketch(sketch)}
                        className="button button--primary button--sm sketch-card__button"
                      >
                        <Calendar size={16} />
                        Забронировать
                      </button>
                    ) : (
                      <button className="button button--outline button--sm sketch-card__button" disabled>
                        Недоступно
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Sketches;
