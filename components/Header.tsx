
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../contexts/LanguageContext';

type NavKey = 'home' | 'about' | 'donate' | 'businesses' | 'events' | 'contact';

const navItems: Array<{ key: NavKey; path: string }> = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'donate', path: '/donate' },
  { key: 'businesses', path: '/businesses' },
  { key: 'events', path: '/events' },
  { key: 'contact', path: '/contact' },
];

const navLabels: Record<'en' | 'es', Record<NavKey, string>> = {
  en: {
    home: 'Home',
    about: 'About',
    donate: 'Donate',
    businesses: 'Businesses',
    events: 'Events',
    contact: 'Contact',
  },
  es: {
    home: 'Inicio',
    about: 'Nosotros',
    donate: 'Donar',
    businesses: 'Negocios',
    events: 'Eventos',
    contact: 'Contacto',
  },
};

const languageOptions: Array<{ code: 'en' | 'es'; label: string }> = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const activeLinkStyle = {
    color: '#d6b209',
    borderBottom: '2px solid #d6b209',
  };

  const linkClasses = "px-3 py-2 rounded-md text-sm md:text-base font-medium text-gray-200 hover:text-white hover:bg-gray-700 transition-colors";
  const mobileLinkClasses = "block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-700 transition-colors";

  return (
    <nav className="bg-black/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d6b209]">
                
                <img
                  src="/coat.svg"
                  alt="Dominicanos Unidos Baltimore emblem"
                  className="h-10 w-10 object-contain"
                />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-white text-lg sm:text-lg font-bold tracking-wide">
                  DOMINICANOS UNIDOS
                </span>
                <span className="text-xs sm:text-xs text-gray-300 uppercase tracking-[0.35em]">
                  DE Baltimore
                </span>
              </span>
            </NavLink>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-baseline space-x-4">
              {navItems.map((link) => (
                <NavLink
                  key={link.key}
                  to={link.path}
                  className={linkClasses}
                  style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                >
                  {navLabels[language][link.key]}
                </NavLink>
              ))}
            </div>
            <div
              className="flex items-center rounded-full bg-gray-800/70 p-1 ring-1 ring-white/10"
              role="group"
              aria-label={language === 'en' ? 'Select language' : 'Seleccionar idioma'}
            >
              {languageOptions.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    language === code
                      ? 'bg-[#d6b209] text-black shadow'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-900 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-xs uppercase tracking-[0.4em] text-gray-500">
                {language === 'en' ? 'Language' : 'Idioma'}
              </span>
              <div className="flex items-center rounded-full bg-gray-800/70 p-1 ring-1 ring-white/10">
                {languageOptions.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLanguage(code);
                      setIsOpen(false);
                    }}
                    className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                      language === code
                        ? 'bg-[#d6b209] text-black shadow'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {navItems.map((link) => (
              <NavLink
                key={link.key}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={mobileLinkClasses}
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                {navLabels[language][link.key]}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;