import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Portfolio.css';

const DEFAULT_IMAGES = [
  { id: 1, src: '/assets/portfolio-1.png', title: 'Black & Grey Lion', category: 'Графика' },
  { id: 2, src: '/assets/portfolio-2.png', title: 'Compass & Rose', category: 'Реализм' },
  { id: 3, src: '/assets/portfolio-3.png', title: 'Owl Spirit', category: 'Блэкворк' },
];

const Portfolio = () => {
  const [images, setImages] = useState(DEFAULT_IMAGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .order('id', { ascending: true });
    
    if (data && data.length > 0) {
      // Map Supabase column names to our component names if they differ
      const formattedData = data.map(item => ({
        id: item.id,
        src: item.image_url,
        title: item.title,
        category: item.category
      }));
      setImages(formattedData);
    }
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section id="portfolio" className="portfolio section-padding">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="portfolio__header"
        >
          <h2 className="section-title">Портфолио</h2>
          <p className="section-subtitle">Избранные работы в стиле Black & Grey</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="portfolio__slider"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="portfolio__slide"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div 
                className="portfolio__image-wrapper"
                onClick={() => setSelectedImage(images[currentIndex])}
              >
                <img 
                  src={images[currentIndex].src} 
                  alt={images[currentIndex].title} 
                  className="portfolio__image" 
                />
                <div className="portfolio__overlay">
                  <div className="portfolio__info">
                    <span className="portfolio__cat">{images[currentIndex].category}</span>
                    <h3 className="portfolio__item-title">{images[currentIndex].title}</h3>
                  </div>
                  <button 
                    className="portfolio__zoom" 
                    onClick={() => setSelectedImage(images[currentIndex])}
                    aria-label="Увеличить"
                  >
                    <Maximize2 size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="portfolio__controls">
            <button className="portfolio__arrow" onClick={prevSlide} aria-label="Назад">
              <ChevronLeft size={24} />
            </button>
            <div className="portfolio__dots">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`portfolio__dot ${index === currentIndex ? 'portfolio__dot--active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Перейти к слайду ${index + 1}`}
                />
              ))}
            </div>
            <button className="portfolio__arrow" onClick={nextSlide} aria-label="Вперед">
              <ChevronRight size={24} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              className="lightbox__content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="lightbox__close" 
                onClick={() => setSelectedImage(null)}
              >
                <X size={32} />
              </button>
              <img src={selectedImage.src} alt={selectedImage.title} className="lightbox__image" />
              <div className="lightbox__caption">
                <h3>{selectedImage.title}</h3>
                <p>{selectedImage.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Portfolio;
