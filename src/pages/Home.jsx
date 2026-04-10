import React from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import Portfolio from '../components/Portfolio/Portfolio';
import Sketches from '../components/Sketches/Sketches';
import Booking from '../components/Booking/Booking';

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <main>
        <Hero />
        <Portfolio />
        <Sketches />
        <Booking />
      </main>
      
      <footer className="footer section-padding" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <p className="footer__text" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--type-sm)', textAlign: 'center' }}>
            © {new Date().getFullYear()} TATTOO STUDIO. ПРЕМИАЛЬНЫЙ СТАНДАРТ КАЧЕСТВА.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
