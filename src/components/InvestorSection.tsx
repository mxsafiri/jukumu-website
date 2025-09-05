'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { DocumentArrowDownIcon, PhoneIcon, ChartBarIcon, UserGroupIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function InvestorSection() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: ChartBarIcon,
      title: 'Mfumo wa Hisa ya 30%',
      description: 'Hisa ya uwazi na ya kina katika kila kundi tunalowekeza',
      color: 'bg-blue-500',
    },
    {
      icon: UserGroupIcon,
      title: 'Uongozi wa Kijamii',
      description: 'Uwekezaji unaolenga jamii na maendeleo endelevu',
      color: 'bg-green-500',
    },
    {
      icon: GlobeAltIcon,
      title: 'Athari Endelevu',
      description: 'Kujenga uchumi wa mzunguko unaoendelea kwa vizazi',
      color: 'bg-orange-500',
    },
  ];

  return (
    <section id="investor" className="relative py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232563eb' fill-opacity='0.4'%3E%3Cpath d='M40 40c0 22.091-17.909 40-40 40v-80c22.091 0 40 17.909 40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
            <span className="text-blue-600 text-sm font-semibold">Fursa za Uwekezaji</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('investor.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Jiunge na wawezeshaji wengine katika kujenga uchumi wa kijamii unaoendelea. 
            Mfumo wetu wa uwazi na ushirikiano unakuhakikishia mapato ya kudumu huku ukisaidia jamii.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Enhanced with Images */}
          <div className="space-y-8">
            {/* Hero Image */}
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/PXL_20250805_160021888.PORTRAIT.jpg"
                alt="Investment opportunity"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Uwekezaji wa Kijamii</h3>
                <p className="text-lg opacity-90">Kujenga mustakabali wa pamoja</p>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="flex items-start space-x-4">
                    <div className={`w-14 h-14 ${benefit.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/investor"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <DocumentArrowDownIcon className="h-6 w-6 mr-3" />
                {t('investor.cta')}
              </a>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                <PhoneIcon className="h-6 w-6 mr-3" />
                Panga Mazungumzo
              </button>
            </div>
          </div>

          {/* Right Visual - Enhanced */}
          <div className="relative space-y-8">
            {/* Investment Process Card */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mfumo wa Uwekezaji</h3>
                <p className="text-gray-600">Hatua za uwekezaji wa kijamii</p>
              </div>
              
              {/* Investment Flow */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">Utafiti wa Kundi</h4>
                    <p className="text-gray-600">Tunachunguza kundi na biashara zao</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">Uwekezaji wa 30%</h4>
                    <p className="text-gray-600">Tunawekeza na kupata hisa ya 30%</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">Mafunzo na Msaada</h4>
                    <p className="text-gray-600">Tunatoa mafunzo na msaada wa kiufundi</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">Mapato ya Pamoja</h4>
                    <p className="text-gray-600">Tunashiriki faida na dividendi</p>
                  </div>
                </div>
              </div>

              {/* ROI Indicator */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border-2 border-green-200">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">15-25%</div>
                  <div className="text-lg font-semibold text-gray-700">Mapato ya Wastani ya Mwaka</div>
                  <div className="text-sm text-gray-600 mt-1">Kulingana na utendaji wa kundi</div>
                </div>
              </div>
            </div>

            {/* Success Stories Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/PXL_20250815_151019991.PORTRAIT.jpg"
                  alt="Investment success"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-sm font-semibold">Mafanikio ya Uwekezaji</p>
                </div>
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/PXL_20250731_150045170.PORTRAIT.jpg"
                  alt="Community growth"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-sm font-semibold">Ukuaji wa Jamii</p>
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-30"></div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-r from-green-200 to-blue-200 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
