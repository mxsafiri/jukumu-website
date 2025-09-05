'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bars3Icon, XMarkIcon, GlobeAltIcon, HomeIcon, InformationCircleIcon, ChartBarIcon, UserPlusIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: t('nav.home'), href: '/#home', icon: HomeIcon },
    { name: t('nav.about'), href: '/#about', icon: InformationCircleIcon },
    { name: t('nav.how_it_works'), href: '/#how-it-works', icon: ChartBarIcon },
    { name: t('nav.impact'), href: '/#impact', icon: ChartBarIcon },
    { name: t('nav.join'), href: '/#join', icon: UserPlusIcon },
    { name: t('nav.investor'), href: '/investor', icon: CurrencyDollarIcon },
  ];

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-orange-500 py-6 lg:border-none">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <span className="text-lg font-bold text-white">J</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JUKUMU</h1>
              </div>
            </Link>
          </div>

          <div className="hidden lg:ml-8 lg:flex lg:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="ml-6 flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200"
            >
              <GlobeAltIcon className="h-4 w-4" />
              <span>{language === 'sw' ? 'EN' : 'SW'}</span>
            </button>

            {/* Login Button */}
            <Link
              href="/login"
              className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors duration-200"
            >
              {t('nav.login')}
            </Link>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open menu</span>
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:hidden`}>
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
