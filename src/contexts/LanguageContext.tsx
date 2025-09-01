'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'sw' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  sw: {
    // Header
    'nav.home': 'Nyumbani',
    'nav.about': 'Kuhusu',
    'nav.how_it_works': 'Jinsi Inavyofanya Kazi',
    'nav.impact': 'Athari',
    'nav.join': 'Jiunge',
    'nav.login': 'Ingia',
    
    // Hero Section
    'hero.title': 'JUKUMU – Kuunganisha Wajasiriamali na Ustawi wa Jamii',
    'hero.subtitle': 'Tunajenga uchumi endelevu kwa kuwawezesha wajasiriamali wadogo.',
    'hero.cta.entrepreneur': 'Jisajili Sasa',
    'hero.cta.investor': 'Shirikiana Nasi',
    
    // About Section
    'about.title': 'Kuhusu JUKUMU',
    'about.vision.title': 'Maono',
    'about.vision.text': 'Kuwa kitovu cha maendeleo ya kijamii na kiuchumi kinacholenga kujenga uchumi wa mzunguko endelevu.',
    'about.mission.title': 'Dhamira',
    'about.mission.text': 'Kuwawezesha wajasiriamali wadogo kupitia mafunzo, mtandao, na uongozi wa kiuchumi.',
    'about.values.title': 'Maadili',
    'about.values.text': 'Uwazi, Ushirikiano, Uongozi, na Maendeleo Endelevu.',
    
    // How It Works
    'how_it_works.title': 'Jinsi JUKUMU Inavyofanya Kazi',
    'how_it_works.step1.title': 'Uanachama na Mafunzo',
    'how_it_works.step1.text': 'Wajasiriamali wanajiunga kupitia vikundi, kulipa ada ndogo ya kila mwezi, na kupata mafunzo.',
    'how_it_works.step2.title': 'Uwekezaji wa Mtaji',
    'how_it_works.step2.text': 'JUKUMU inawekeza katika vikundi, hisa ya 30% ya uongozi.',
    'how_it_works.step3.title': 'Uchumi wa Mzunguko',
    'how_it_works.step3.text': 'Rasilimali zinazunguka ndani ya mtandao.',
    'how_it_works.step4.title': 'Ustawi wa Pamoja',
    'how_it_works.step4.text': 'Faida na mgao wa faida vinashirikiwa.',
    
    // Impact
    'impact.title': 'Athari Yetu',
    'impact.groups': 'Vikundi',
    'impact.cbts': 'CBTs',
    'impact.businesses': 'Biashara',
    'impact.growing': 'Mtandao Unaokua',
    
    // Registration
    'registration.title': 'Jisajili kwa JUKUMU',
    'registration.name': 'Jina Kamili',
    'registration.contact': 'Mawasiliano (Simu/Barua pepe)',
    'registration.location': 'Mahali',
    'registration.business_type': 'Aina ya Biashara',
    'registration.group_name': 'Jina la Kundi (ikiwa tayari uko katika kimoja)',
    'registration.gender': 'Jinsia',
    'registration.age': 'Umri',
    'registration.submit': 'Wasilisha',
    
    // Investor Section
    'investor.title': 'Kwa Nini Uwekeze na JUKUMU?',
    'investor.subtitle': 'Mfumo wa hisa ya 30%, uongozi wa kijamii, athari endelevu.',
    'investor.cta': 'Pakua Hati za Mwekezaji',
    
    // Footer
    'footer.contact': 'Mawasiliano',
    'footer.social': 'Mitandao ya Kijamii',
    'footer.legal': 'Kisheria',
    'footer.privacy': 'Sera ya Faragha',
    'footer.terms': 'Masharti',
    
    // Common
    'tagline': 'Kuwawezesha Wajasiriamali, Kujenga Uchumi wa Mzunguko.',
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.how_it_works': 'How It Works',
    'nav.impact': 'Impact',
    'nav.join': 'Join',
    'nav.login': 'Login',
    
    // Hero Section
    'hero.title': 'JUKUMU – Connecting Entrepreneurs with Community Prosperity',
    'hero.subtitle': 'We empower small entrepreneurs through training, networks, and economic leadership for a sustainable circular economy.',
    'hero.cta.entrepreneur': 'Register Now',
    'hero.cta.investor': 'Partner With Us',
    
    // About Section
    'about.title': 'About JUKUMU',
    'about.vision.title': 'Vision',
    'about.vision.text': 'To be a center for social and economic development that aims to build a sustainable circular economy.',
    'about.mission.title': 'Mission',
    'about.mission.text': 'To empower small entrepreneurs through training, networks, and economic leadership.',
    'about.values.title': 'Values',
    'about.values.text': 'Transparency, Collaboration, Leadership, and Sustainable Development.',
    
    // How It Works
    'how_it_works.title': 'How JUKUMU Works',
    'how_it_works.step1.title': 'Membership & Training',
    'how_it_works.step1.text': 'Entrepreneurs join via groups, pay small monthly fees, and receive training.',
    'how_it_works.step2.title': 'Capital Investment',
    'how_it_works.step2.text': 'JUKUMU invests in groups with a 30% equity stake.',
    'how_it_works.step3.title': 'Circular Economy',
    'how_it_works.step3.text': 'Resources circulate within the network.',
    'how_it_works.step4.title': 'Shared Prosperity',
    'how_it_works.step4.text': 'Profits and dividends are shared back.',
    
    // Impact
    'impact.title': 'Our Impact',
    'impact.groups': 'Groups',
    'impact.cbts': 'CBTs',
    'impact.businesses': 'Businesses',
    'impact.growing': 'Growing Network',
    
    // Registration
    'registration.title': 'Register with JUKUMU',
    'registration.name': 'Full Name',
    'registration.contact': 'Contact (Phone/Email)',
    'registration.location': 'Location',
    'registration.business_type': 'Business Type',
    'registration.group_name': 'Group Name (if already in one)',
    'registration.gender': 'Gender',
    'registration.age': 'Age',
    'registration.submit': 'Submit',
    
    // Investor Section
    'investor.title': 'Why Invest with JUKUMU?',
    'investor.subtitle': '30% equity model, community-driven, sustainable impact.',
    'investor.cta': 'Download Investor Deck',
    
    // Footer
    'footer.contact': 'Contact',
    'footer.social': 'Social Media',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    
    // Common
    'tagline': 'Empowering Entrepreneurs, Building a Circular Economy.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('sw');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'sw' ? 'en' : 'sw');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['sw']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
