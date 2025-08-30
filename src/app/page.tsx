import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ImpactSection from '@/components/ImpactSection';
import RegistrationSection from '@/components/RegistrationSection';
import InvestorSection from '@/components/InvestorSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ImpactSection />
        <RegistrationSection />
        <InvestorSection />
      </main>
      <Footer />
    </div>
  );
}
