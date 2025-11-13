import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { pageDefaults } from '../lib/pageDefaults';
import { usePageContent } from '../hooks/usePageContent';

interface ApiEvent {
  id: string;
  folder: string;
  assets: Array<{ key: string; url: string }>;
  content?: {
    en?: { title?: string; description?: string; date?: string };
    es?: { title?: string; description?: string; date?: string };
  };
}

const copy = {
  en: {
    back: '← Back to Events',
    loading: 'Loading event…',
    error: 'Unable to load this event. Please try again later.',
    empty: 'No media available yet for this event.',
    openImage: 'Open image',
    gallerySubtitle: 'Event gallery',
  },
  es: {
    back: '← Volver a Eventos',
    loading: 'Cargando evento…',
    error: 'No pudimos cargar este evento. Inténtalo nuevamente más tarde.',
    empty: 'Aún no hay contenido disponible para este evento.',
    openImage: 'Abrir imagen',
    gallerySubtitle: 'Galería del evento',
  },
} as const;

const EventGalleryPage: React.FC = () => {
  const { language } = useLanguage();
  const { eventId } = useParams();
  const location = useLocation();
  const preloadedEvent = (location.state as { event?: ApiEvent } | undefined)?.event;
  const navigate = useNavigate();
  const [event, setEvent] = useState<ApiEvent | null>(preloadedEvent ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const isSelectedVideo = selectedImage ? /\.(mp4|webm|ogg|mov)$/i.test(selectedImage) : false;

  const decodedId = useMemo(() => {
    if (!eventId) return null;
    try {
      return decodeURIComponent(eventId);
    } catch (err) {
      console.error('Failed to decode event id', err);
      return null;
    }
  }, [eventId]);

  useEffect(() => {
    let isMounted = true;

    async function loadEvent() {
      if (!decodedId) {
        setError('Invalid event.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to load events');
        }
        const data: ApiEvent[] = await response.json();
        const match =
          data.find((item) => item.id === decodedId) ??
          data.find((item) => item.folder === decodedId) ??
          null;
        if (isMounted) {
          setEvent(match);
          setError(match ? null : 'Event not found.');
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load events');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [decodedId]);

  useEffect(() => {
    if (!decodedId && !isLoading) {
      navigate('/events');
    }
  }, [decodedId, isLoading, navigate]);

  const labels = copy[language];
  const defaults = pageDefaults.events;
  const { content: pageCopy } = usePageContent('events', defaults);
  const fallbackCopy = pageCopy[language as keyof typeof defaults] as {
    fallbackDescription: string;
  };
  const localized = event?.content?.[language];

  const title = useMemo(() => {
    if (localized?.title) return localized.title;
    if (event?.folder) return event.folder;
    if (isLoading) return copy[language].loading;
    return decodedId ?? (language === 'en' ? 'Event' : 'Evento');
  }, [decodedId, event, isLoading, language, localized]);
  const subtitle = localized?.description ?? fallbackCopy.fallbackDescription;

  return (
    <PageWrapper title={title} subtitle={subtitle}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/events"
          className="inline-flex items-center text-sm font-semibold text-[#d6b209] hover:text-[#b79807] transition-colors"
        >
          {labels.back}
        </Link>
        {localized?.date && (
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#d6b209]">
            {localized.date}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="text-center text-gray-400 py-12">
          {labels.loading}
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center text-[#ce1226] py-12">
          {language === 'en' ? labels.error : 'No pudimos cargar este evento. Inténtalo nuevamente más tarde.'}
        </div>
      )}

      {!isLoading && !error && event && event.assets.length === 0 && (
        <div className="text-center text-gray-400 py-12">{labels.empty}</div>
      )}

      {!isLoading && !error && event && event.assets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {event.assets.map((asset) => {
            const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(asset.url);
            const name = asset.key.split('/').pop() ?? asset.key;
            return (
              <button
                key={asset.key}
                type="button"
                onClick={() => setSelectedImage(asset.url)}
                className="group relative overflow-hidden rounded-xl bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d6b209]"
              >
                {isVideo ? (
                  <video
                    src={asset.url}
                    className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={asset.url}
                    alt={name}
                    loading="lazy"
                    className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex pl-1 h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white text-3xl drop-shadow-lg">
                      ▶
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedImage && event?.assets.some((asset) => asset.url === selectedImage) && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-full max-w-4xl">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-2xl font-bold hover:text-[#d6b209] transition"
              aria-label={language === 'en' ? 'Close image' : 'Cerrar imagen'}
            >
              ×
            </button>
            {isSelectedVideo ? (
              <video
                src={selectedImage}
                controls
                className="max-h-[80vh] w-full object-contain rounded-lg"
              />
            ) : (
              <img
                src={selectedImage}
                alt={labels.openImage}
                className="max-h-[80vh] w-full object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default EventGalleryPage;

