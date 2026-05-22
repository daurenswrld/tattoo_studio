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
  const [categories, setCategories] = useState(['Все']);
  const [filter, setFilter] = useState('Все');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPortfolio();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('portfolio_categories')
        .select('name')
        .order('name');
      if (data && Array.isArray(data)) {
        setCategories(['Все', ...data.map(c => c.name)]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('id', { ascending: true })
        .limit(10); // Adding limit just in case
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedData = data.map(item => ({
          id: item.id,
          src: item.image_url,
          title: item.title,
          category: item.category,
          isFeatured: item.is_featured
        }));
        setImages(formattedData);
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      // Keep DEFAULT_IMAGES on error
    }
  };

  const filteredImages = images.filter(img => 
    filter === 'Все' || img.category === filter
  );

  // Close lightbox on Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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

        <div className="portfolio__filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'filter-btn--active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div 
          layout
          className="portfolio__grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="portfolio__empty"
              >
                <div className="empty-content">
                  <span className="empty-icon">✧</span>
                  <p>Пространство в ожидании искусства</p>
                  <small>Новые работы скоро появятся в галерее</small>
                </div>
              </motion.div>
            ) : (
              filteredImages.map((image) => (
                <motion.div
                  layout
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className={`portfolio__item ${image.isFeatured ? 'portfolio__item--featured' : ''}`}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="portfolio__image-wrapper">
                    <img 
                      src={image.src} 
                      alt={image.title} 
                      className="portfolio__image" 
                      loading="lazy"
                    />
                    <div className="portfolio__overlay">
                      <div className="portfolio__info">
                        <span className="portfolio__cat">{image.category}</span>
                        <h3 className="portfolio__item-title">{image.title}</h3>
                      </div>
                      <div className="portfolio__zoom">
                        <Maximize2 size={20} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
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
