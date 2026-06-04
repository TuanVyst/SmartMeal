import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import PopularMeals from './components/PopularMeals';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PopularMeals />
      <CTASection />
      <Footer />
    </div>
  );
}
