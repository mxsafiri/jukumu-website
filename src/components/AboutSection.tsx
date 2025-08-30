'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { AcademicCapIcon, CurrencyDollarIcon, ArrowPathIcon, UsersIcon } from '@heroicons/react/24/outline';
import { EyeIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';

export default function AboutSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: AcademicCapIcon,
      title: t('how_it_works.step1.title'),
      description: t('how_it_works.step1.text'),
      color: 'from-blue-500 to-blue-600',
      image: '/PXL_20250531_114540969.PORTRAIT.jpg',
    },
    {
      icon: CurrencyDollarIcon,
      title: t('how_it_works.step2.title'),
      description: t('how_it_works.step2.text'),
      color: 'from-green-500 to-green-600',
      image: '/PXL_20250618_114941185.MP.jpg',
    },
    {
      icon: ArrowPathIcon,
      title: t('how_it_works.step3.title'),
      description: t('how_it_works.step3.text'),
      color: 'from-orange-500 to-orange-600',
      image: '/PXL_20250707_145652539.PORTRAIT.jpg',
    },
    {
      icon: UsersIcon,
      title: t('how_it_works.step4.title'),
      description: t('how_it_works.step4.text'),
      color: 'from-red-500 to-red-600',
      image: '/PXL_20250716_145812315.PORTRAIT.jpg',
    },
  ];

  return (
    <section id="about" className="relative py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* About Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-6">
            <span className="text-orange-600 text-sm font-semibold">Kuhusu Sisi</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('about.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Vision, Mission, Values with Images */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 p-8 text-white transform hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 opacity-20">
              <Image
                src="/PXL_20250805_145020244.PORTRAIT.jpg"
                alt="Vision"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <EyeIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('about.vision.title')}</h3>
              <p className="text-orange-100 leading-relaxed">{t('about.vision.text')}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 p-8 text-white transform hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 opacity-20">
              <Image
                src="/PXL_20250621_071351878.PORTRAIT.jpg"
                alt="Mission"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('about.mission.title')}</h3>
              <p className="text-green-100 leading-relaxed">{t('about.mission.text')}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 p-8 text-white transform hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 opacity-20">
              <Image
                src="/PXL_20250729_122409694.PORTRAIT.jpg"
                alt="Values"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <StarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('about.values.title')}</h3>
              <p className="text-blue-100 leading-relaxed">{t('about.values.text')}</p>
            </div>
          </div>
        </div>

        {/* How It Works - Redesigned */}
        <div className="space-y-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
              <span className="text-blue-600 text-sm font-semibold">Mchakato Wetu</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('how_it_works.title')}
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fuata hatua hizi nne za kimsingi kujiunge na jamii yetu ya wajasiriamali
            </p>
          </div>

          <div className="space-y-16">
            {features.map((feature, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                {/* Image Side */}
                <div className="lg:w-1/2 relative">
                  <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:w-1/2 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    <span>Mchakato unaoendelea</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
