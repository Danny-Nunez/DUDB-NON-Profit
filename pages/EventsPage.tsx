import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';
import { pageDefaults } from '../lib/pageDefaults';
import { usePageContent } from '../hooks/usePageContent';

const VIDEO_REGEX = /\.(mp4|webm|ogg|mov)$/i;

interface ApiEvent {
  id: string;
  folder: string;
  assets: Array<{ key: string; url: string }>;
  content?: {
    en?: { title?: string; description?: string; date?: string };
    es?: { title?: string; description?: string; date?: string };
  };
}

const EventsPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const defaults = pageDefaults.events;
  const { content: pageCopy } = usePageContent('events', defaults);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to load events');
        }
        const data: ApiEvent[] = await response.json();
        if (isMounted) {
          setEvents(data);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(
            language === 'en'
              ? 'Unable to load events. Please try again later.'
              : 'No pudimos cargar los eventos. Inténtalo nuevamente más tarde.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const copy = pageCopy[language as keyof typeof defaults] as {
    title: string;
    subtitle: string;
    fallbackDescription: string;
  };

  const handleNavigate = useCallback(
    (event: ApiEvent) => {
      const target = event.id ?? event.folder;
      const encoded = encodeURIComponent(target);
      navigate(`/events/${encoded}`, { state: { event } });
    },
    [navigate],
  );

  return (
    <PageWrapper title={copy.title} subtitle={copy.subtitle}>
      {isLoading && (
        <div className="text-center text-gray-400 py-12">
          {language === 'en' ? 'Loading events…' : 'Cargando eventos…'}
        </div>
      )}
      {error && (
        <div className="text-center text-[#ce1226] py-12">
          {language === 'en' ? error : 'No pudimos cargar los eventos. Inténtalo nuevamente más tarde.'}
        </div>
      )}
      {!isLoading && !error && events.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          {language === 'en'
            ? 'No events available yet. Check back soon!'
            : 'Aún no hay eventos disponibles. ¡Vuelve pronto!'}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => {
          const previewAsset =
            event.assets.find((asset) => !VIDEO_REGEX.test(asset.url)) ?? event.assets[0];
          const localized = event.content?.[language];
          return (
            <Card
              key={event.id ?? event.folder}
              imageUrl={previewAsset?.url ?? 'https://placehold.co/600x400?text=Dominicanos+Unidos'}
              title={localized?.title ?? event.folder}
              subtitle={localized?.date ?? ''}
              description={localized?.description ?? copy.fallbackDescription}
              onClick={() => handleNavigate(event)}
            />
          );
        })}
      </div>
    </PageWrapper>
  );
};

export default EventsPage;

