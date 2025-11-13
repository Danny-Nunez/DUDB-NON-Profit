import React, { useEffect, useState, useCallback } from 'react';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';
import { pageDefaults } from '../lib/pageDefaults';
import { usePageContent } from '../hooks/usePageContent';

interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  imageKey?: string;
  contact?: string;
  hours?: string;
  address?: string;
}

const BusinessesPage: React.FC = () => {
  const { language } = useLanguage();
  const defaultContent = pageDefaults.businesses;
  const { content } = usePageContent('businesses', defaultContent);
  const copy = content[language as keyof typeof defaultContent] as { title: string; subtitle: string };

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBusinesses() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/businesses');
        if (!response.ok) {
          throw new Error('Failed to load businesses');
        }
        const data = (await response.json()) as { businesses: Business[] };
        if (isMounted) {
          setBusinesses(data.businesses);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(
            language === 'en'
              ? 'Unable to load businesses at this time.'
              : 'No pudimos cargar los negocios en este momento.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBusinesses();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const closeModal = useCallback(() => {
    setSelectedBusiness(null);
  }, []);

  return (
    <PageWrapper title={copy.title} subtitle={copy.subtitle}>
      {isLoading && (
        <div className="text-center text-gray-400 py-12">
          {language === 'en' ? 'Loading businesses…' : 'Cargando negocios…'}
        </div>
      )}
      {error && (
        <div className="text-center text-[#ce1226] py-12">
          {error}
        </div>
      )}
      {!isLoading && !error && businesses.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          {language === 'en'
            ? 'No businesses available yet.'
            : 'Aún no hay negocios disponibles.'}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {businesses.map((business) => {
          const details: string[] = [];
          if (business.address) {
            details.push(`${language === 'en' ? 'Address:' : 'Dirección:'} ${business.address}`);
          }
          if (business.hours) {
            details.push(`${language === 'en' ? 'Hours:' : 'Horario:'} ${business.hours}`);
          }
          if (business.contact) {
            details.push(`${language === 'en' ? 'Contact:' : 'Contacto:'} ${business.contact}`);
          }
          return (
            <Card
              key={business.id}
              imageUrl={business.imageUrl}
              title={business.name}
              subtitle={business.category}
              description={details.join('\n\n')}
              onClick={() => setSelectedBusiness(business)}
            />
          );
        })}
      </div>

      {selectedBusiness && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-gray-950 border border-[#012d62]/40 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 text-white text-2xl font-bold hover:text-[#d6b209] transition"
              aria-label={language === 'en' ? 'Close details' : 'Cerrar detalles'}
            >
              ×
            </button>
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
              <div className="relative h-64 md:h-full bg-black/60">
                <img
                  src={selectedBusiness.imageUrl}
                  alt={selectedBusiness.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">{selectedBusiness.name}</h3>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d6b209] drop-shadow">
                    {selectedBusiness.category}
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {selectedBusiness.description && (
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {selectedBusiness.description}
                  </p>
                )}
                <div className="space-y-3 text-sm text-gray-300">
                  {selectedBusiness.address && (
                    <div>
                      <span className="font-semibold text-white block text-xs uppercase tracking-[0.3em]">
                        {language === 'en' ? 'Address' : 'Dirección'}
                      </span>
                      <span>{selectedBusiness.address}</span>
                    </div>
                  )}
                  {selectedBusiness.hours && (
                    <div>
                      <span className="font-semibold text-white block text-xs uppercase tracking-[0.3em]">
                        {language === 'en' ? 'Hours' : 'Horario'}
                      </span>
                      <span>{selectedBusiness.hours}</span>
                    </div>
                  )}
                  {selectedBusiness.contact && (
                    <div>
                      <span className="font-semibold text-white block text-xs uppercase tracking-[0.3em]">
                        {language === 'en' ? 'Contact' : 'Contacto'}
                      </span>
                      <span>{selectedBusiness.contact}</span>
                    </div>
                  )}
                </div>
                {selectedBusiness.address && (
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(selectedBusiness.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-[#d6b209] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#b79807]"
                  >
                    {language === 'en' ? 'Get Directions' : 'Obtener direcciones'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default BusinessesPage;

