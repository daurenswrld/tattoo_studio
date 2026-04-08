import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__bg"></div>
      <div className="container hero__container">
        <motion.div 
          className="hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="hero__title">
            Искусство, которое <br /> <span>всегда с тобой</span>
          </h1>
          <p className="hero__subtitle">
            Премиальные татуировки в частной студии. Индивидуальный подход, 
            стерильность и внимание к каждой детали.
          </p>
          <div className="hero__actions">
            <a href="#booking" className="button button--primary">
              Записаться на сеанс
              <ArrowRight size={20} />
            </a>
            <a href="#portfolio" className="button button--outline">
              Смотреть портфолио
            </a>
          </div>
        </motion.div>
      </div>
      
      <div className="hero__scroll-indicator">
        <div className="hero__scroll-line"></div>
      </div>
    </section>
  );
};

export default Hero;
