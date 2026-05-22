import React from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import Portfolio from '../components/Portfolio/Portfolio';
import Sketches from '../components/Sketches/Sketches';
import Booking from '../components/Booking/Booking';
import Footer from '../components/Footer/Footer';

const Home = () => {
  const [selectedSketch, setSelectedSketch] = React.useState(null);

  const handleSketchSelect = (sketch) => {
    setSelectedSketch(sketch);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      <Header />
      <main>
        <Hero />
        <Booking initialSketch={selectedSketch} />
        <Portfolio />
        <Sketches onSelectSketch={handleSketchSelect} />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
