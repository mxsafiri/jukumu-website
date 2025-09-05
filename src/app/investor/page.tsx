'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  HandRaisedIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon,
  BuildingStorefrontIcon,
  AcademicCapIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface NetworkStats {
  totalMembers: number;
  totalGroups: number;
  totalInvestment: number;
  totalReturns: number;
  averageReturn: number;
  activeRegions: number;
}

export default function InvestorPage() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetworkStats();
  }, []);

  const loadNetworkStats = async () => {
    try {
      const response = await fetch('/api/investor/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback to mock data if API fails
        setStats({
          totalMembers: 1247,
          totalGroups: 89,
          totalInvestment: 45600000,
          totalReturns: 8200000,
          averageReturn: 18,
          activeRegions: 12
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to mock data on error
      setStats({
        totalMembers: 1247,
        totalGroups: 89,
        totalInvestment: 45600000,
        totalReturns: 8200000,
        averageReturn: 18,
        activeRegions: 12
      });
    } finally {
      setLoading(false);
    }
  };

  const content = {
    en: {
      hero: {
        title: "Invest in Tanzania's Growing Community Network",
        subtitle: "Join JUKUMU Fund and unlock opportunities in local entrepreneurship and collective investment",
        description: "Partner with us to empower communities through sustainable economic growth and proven investment returns.",
        cta: "Explore Investment Opportunities"
      },
      stats: {
        title: "Our Growing Network",
        subtitle: "Real impact through community-driven investment"
      },
      mission: {
        title: "Why Invest in JUKUMU?",
        subtitle: "Sustainable returns through community empowerment",
        points: [
          "Direct access to high-growth local businesses",
          "Proven track record of community investment success",
          "Diversified portfolio across multiple sectors",
          "Social impact with financial returns",
          "Local expertise and market knowledge"
        ]
      },
      opportunities: {
        title: "Investment Opportunities",
        subtitle: "Multiple pathways to participate in Tanzania's economic growth",
        sectors: [
          {
            name: "Agriculture & Farming",
            description: "Support local farmers with modern techniques and equipment",
            potential: "15-25% annual returns"
          },
          {
            name: "Small Business Development",
            description: "Empower entrepreneurs with capital and training",
            potential: "20-30% annual returns"
          },
          {
            name: "Technology & Innovation",
            description: "Fund digital solutions for local challenges",
            potential: "25-40% annual returns"
          }
        ]
      },
      cta: {
        title: "Ready to Make an Impact?",
        subtitle: "Join our network of investors creating positive change",
        button: "Contact Our Investment Team"
      }
    },
    sw: {
      hero: {
        title: "Wekeza kwenye Mtandao wa Jamii Unaoongezeka Tanzania",
        subtitle: "Jiunge na JUKUMU Fund na fungua fursa za uongozaji wa biashara za mitaa na uwekezaji wa pamoja",
        description: "Shirikiana nasi kuwezesha jamii kupitia ukuaji wa kiuchumi endelevu na mapato ya uwekezaji yaliyothibitishwa.",
        cta: "Chunguza Fursa za Uwekezaji"
      },
      stats: {
        title: "Mtandao Wetu Unaoongezeka",
        subtitle: "Athari halisi kupitia uwekezaji unaoongozwa na jamii"
      },
      mission: {
        title: "Kwa Nini Uwekeze JUKUMU?",
        subtitle: "Mapato endelevu kupitia kuwezesha jamii",
        points: [
          "Upatikanaji wa moja kwa moja wa biashara za mitaa zinazokua kwa kasi",
          "Rekodi iliyothibitishwa ya mafanikio ya uwekezaji wa jamii",
          "Mkusanyiko wa uwekezaji uliogawanywa katika sekta nyingi",
          "Athari za kijamii pamoja na mapato ya kifedha",
          "Utaalamu wa mitaa na ujuzi wa soko"
        ]
      },
      opportunities: {
        title: "Fursa za Uwekezaji",
        subtitle: "Njia nyingi za kushiriki katika ukuaji wa kiuchumi wa Tanzania",
        sectors: [
          {
            name: "Kilimo na Ufugaji",
            description: "Kusaidia wakulima wa mitaa kwa mbinu za kisasa na vifaa",
            potential: "Mapato ya 15-25% kwa mwaka"
          },
          {
            name: "Maendeleo ya Biashara Ndogo",
            description: "Kuwezesha wajasiriamali kwa mtaji na mafunzo",
            potential: "Mapato ya 20-30% kwa mwaka"
          },
          {
            name: "Teknolojia na Uvumbuzi",
            description: "Kufadhili suluhisho za kidijitali kwa changamoto za mitaa",
            potential: "Mapato ya 25-40% kwa mwaka"
          }
        ]
      },
      cta: {
        title: "Uko Tayari Kuleta Mabadiliko?",
        subtitle: "Jiunge na mtandao wetu wa wawekezaji wanaoleta mabadiliko mazuri",
        button: "Wasiliana na Timu Yetu ya Uwekezaji"
      }
    }
  };

  const currentContent = content[language as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Redesigned to match home page style */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0">
          <Image
            src="/PXL_20250618_112718098.PORTRAIT.jpg"
            alt="JUKUMU Investment Opportunities"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-300/30">
                    <span className="text-green-200 text-sm font-medium">
                      Investment Opportunity
                    </span>
                  </div>
                  
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                    <span className="block">Invest in</span>
                    <span className="block text-green-400 text-3xl sm:text-4xl lg:text-5xl font-normal mt-2">
                      Tanzania&apos;s Future
                    </span>
                  </h1>
                  
                  <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed max-w-2xl">
                    {currentContent.hero.description}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <ArrowRightIcon className="h-5 w-5 mr-2" />
                    {currentContent.hero.cta}
                  </button>
                  <button className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Watch Our Story
                  </button>
                </div>
              </div>

              {/* Right Visual - Live Stats */}
              <div className="lg:col-span-5 relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white mb-8 text-center">Live Network Stats</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-green-300/30">
                        <UsersIcon className="h-8 w-8 text-green-400" />
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {loading ? '...' : stats?.totalMembers?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-300">Active Members</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-300/30">
                        <UserGroupIcon className="h-8 w-8 text-orange-400" />
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {loading ? '...' : stats?.totalGroups?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-300">Investment Groups</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-300/30">
                        <CurrencyDollarIcon className="h-8 w-8 text-blue-400" />
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {loading ? '...' : (stats?.totalInvestment && stats.totalInvestment > 0) ? `TSH ${(stats.totalInvestment / 1000000).toFixed(1)}M` : 'TSH 0'}
                      </div>
                      <div className="text-sm text-gray-300">Total Investment</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-300/30">
                        <ArrowTrendingUpIcon className="h-8 w-8 text-purple-400" />
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {loading ? '...' : `${stats?.averageReturn || 0}%`}
                      </div>
                      <div className="text-sm text-gray-300">Average Returns</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-green-300/30">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-orange-300/30">
                  <CurrencyDollarIcon className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Mission Section - Redesigned to match impact section style */}
      <section className="relative py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2315803d' fill-opacity='0.4'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full mb-6">
              <span className="text-green-600 text-sm font-semibold">Investment Value</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {currentContent.mission.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {currentContent.mission.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentContent.mission.points.map((point, index) => (
              <div key={index} className="group relative overflow-hidden rounded-3xl bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{point}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunities - Redesigned with images */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
              <span className="text-blue-600 text-sm font-semibold">Investment Sectors</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {currentContent.opportunities.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {currentContent.opportunities.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {currentContent.opportunities.sectors.map((sector, index) => {
              const sectorImages = [
                '/PXL_20250531_095142372.PORTRAIT.jpg',
                '/PXL_20250618_095258793.PORTRAIT.jpg',
                '/PXL_20250805_160021888.PORTRAIT.jpg'
              ];
              const sectorIcons = [BuildingStorefrontIcon, AcademicCapIcon, BanknotesIcon];
              const SectorIcon = sectorIcons[index];
              
              return (
                <div key={index} className="group relative overflow-hidden rounded-3xl bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="aspect-w-16 aspect-h-9 relative h-64">
                    <Image
                      src={sectorImages[index]}
                      alt={sector.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <SectorIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{sector.name}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{sector.description}</p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-700 font-medium mb-1">Expected Returns</div>
                      <div className="text-lg font-bold text-green-800">{sector.potential}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action - Redesigned */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/PXL_20250716_145532532.PORTRAIT.jpg"
            alt="JUKUMU Community"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            {currentContent.cta.title}
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            {currentContent.cta.subtitle}
          </p>
          <button className="inline-flex items-center px-8 py-4 bg-white text-green-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
            <HandRaisedIcon className="h-6 w-6 mr-3" />
            <span className="text-lg">{currentContent.cta.button}</span>
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
