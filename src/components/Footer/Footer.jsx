import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Send, Map, Phone, MessageSquare } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__grid">
          <div className="footer__brand">
            <h2 className="footer__logo">TATTOO STUDIO</h2>
            <p className="footer__tagline">
              Превращаем идеи в искусство, которое остается с вами навсегда. 
              Премиальный сервис в стиле Black & Grey.
            </p>
            <div className="footer__socials">
              <a href="#" className="social-link" aria-label="Instagram">
                <Camera size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Telegram">
                <Send size={20} />
              </a>
            </div>
          </div>

          <div className="footer__nav">
            <h3 className="footer__title">Навигация</h3>
            <ul className="footer__links">
              <li><a href="#portfolio">Портфолио</a></li>
              <li><a href="#sketches">Витрина эскизов</a></li>
              <li><a href="#booking">Записаться</a></li>
              <li><a href="/admin">Вход для мастера</a></li>
            </ul>
          </div>

          <div className="footer__contact">
            <h3 className="footer__title">Контакты</h3>
            <ul className="footer__info">
              <li>
                <Map size={16} />
                <span>Алматы, пр. Аль-Фараби, 17</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+7 (707) 123-45-67</span>
              </li>
              <li>
                <MessageSquare size={16} />
                <span>info@tattoostudio.kz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {currentYear} TATTOO STUDIO. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
