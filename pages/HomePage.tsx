
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { pageDefaults } from '../lib/pageDefaults';
import { usePageContent } from '../hooks/usePageContent';

const VIDEO_SOURCES = ['/dance.mp4', '/group.mp4'];
const FADE_DURATION_MS = 1500;

const HomePage: React.FC = () => {
  const { language } = useLanguage();
  const defaultContent = pageDefaults.home;
  const { content } = usePageContent('home', defaultContent);
  const copy = content[language as keyof typeof defaultContent] as (typeof defaultContent)['en'];
  const defaultNewsletter = (defaultContent[language as keyof typeof defaultContent] as (typeof defaultContent)['en']).newsletter;
  const newsletterCopy = {
    ...defaultNewsletter,
    ...(copy.newsletter ?? {}),
  } as (typeof defaultNewsletter);
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const previousVideoRef = useRef<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newsletterResult, setNewsletterResult] = useState<'success' | 'already' | null>(null);

  const handleVideoEnd = useCallback(
    (index: number) => {
      previousVideoRef.current = index;
      const nextIndex = (index + 1) % VIDEO_SOURCES.length;
      setActiveVideo(nextIndex);
    },
    [],
  );

  useEffect(() => {
    let resetTimeoutId: number | undefined;

    const currentVideo = videoRefs.current[activeVideo];
    if (currentVideo) {
      currentVideo.currentTime = 0;
      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          /* Autoplay was prevented */
        });
      }
    }

    const previousIndex = previousVideoRef.current;
    if (previousIndex !== null && previousIndex !== activeVideo) {
      const previousVideo = videoRefs.current[previousIndex];
      if (previousVideo) {
        previousVideo.pause();
        resetTimeoutId = window.setTimeout(() => {
          previousVideo.currentTime = 0;
          previousVideoRef.current = null;
        }, FADE_DURATION_MS);
      }
    }

    return () => {
      if (resetTimeoutId !== undefined) {
        window.clearTimeout(resetTimeoutId);
      }
    };
  }, [activeVideo]);

  const handleToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const newsletterButtonLabel = useMemo(() => {
    if (newsletterStatus === 'submitting') {
      return newsletterCopy.submitting ?? newsletterCopy.cta;
    }
    return newsletterCopy.cta;
  }, [newsletterCopy.cta, newsletterCopy.submitting, newsletterStatus]);

  const handleNewsletterSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (newsletterStatus === 'submitting') return;

      const email = newsletterEmail.trim();
      if (!email) {
        setNewsletterStatus('error');
        setNewsletterError(
          language === 'en'
            ? 'Please enter your email address to subscribe.'
            : 'Por favor ingresa tu correo electrónico para suscribirte.',
        );
        handleToast('error', newsletterCopy.errorMessage);
        return;
      }

      setNewsletterStatus('submitting');
      setNewsletterError(null);
      setNewsletterResult(null);

      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, language }),
        });

        const payload = await response.json().catch(() => ({}));
        console.log('Newsletter response', { status: response.status, payload });

        const isAlreadySubscribed =
          payload?.code === 'already_subscribed' ||
          (typeof payload?.message === 'string' && payload.message.toLowerCase().includes('already'));
        const requiresReactivation = payload?.code === 'reactivation_required';

        if (requiresReactivation) {
          setNewsletterStatus('error');
          setNewsletterError(newsletterCopy.reactivationMessage);
          setNewsletterResult(null);
          handleToast('error', newsletterCopy.reactivationMessage);
          return;
        }

        if (!response.ok && !isAlreadySubscribed) {
          throw new Error(payload?.message ?? 'Request failed');
        }

        setNewsletterStatus('success');
        setNewsletterResult(isAlreadySubscribed ? 'already' : 'success');
        setNewsletterEmail('');
        handleToast('success', isAlreadySubscribed ? newsletterCopy.alreadyMessage || newsletterCopy.successMessage : newsletterCopy.successMessage);
      } catch (error) {
        console.error('Newsletter subscription failed', error);
        console.log('Newsletter state', {
          email: newsletterEmail,
          status: newsletterStatus,
        });
        setNewsletterStatus('error');
        setNewsletterError(
          error instanceof Error && error.message ? error.message : newsletterCopy.errorMessage,
        );
        setNewsletterResult(null);
        handleToast('error', newsletterCopy.errorMessage);
      }
    },
    [newsletterCopy.errorMessage, newsletterCopy.successMessage, newsletterCopy.alreadyMessage, newsletterCopy.reactivationMessage, language, newsletterEmail, newsletterStatus, handleToast],
  );

  return (
    <div className="text-white bg-black min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-black overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0">
          {VIDEO_SOURCES.map((src, index) => (
            <video
              key={src}
              ref={(element) => {
                videoRefs.current[index] = element;
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
                activeVideo === index ? 'opacity-30' : 'opacity-0'
              }`}
              src={src}
              autoPlay
              muted
              playsInline
              onEnded={() => handleVideoEnd(index)}
            />
          ))}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none h-80"
            style={{
              background:
                'linear-gradient(0deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 45%, rgba(0, 0, 0, 0.2) 75%, rgba(0, 0, 0, 0) 100%)',
            }}
          ></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center py-24 sm:py-32 lg:py-40">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)]">
            <span className="block text-[#d6b209]">{copy.hero.lineOne}</span>
            <span className="block text-white">{copy.hero.lineTwo}</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-xl text-gray-200 sm:max-w-3xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
            {copy.hero.description}
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <NavLink
              to="/about"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#012d62] hover:bg-[#001f45] shadow-lg shadow-[#012d62]/40 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              {copy.hero.primaryCta}
            </NavLink>
            <NavLink
              to="/donate"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#ce1226] hover:bg-[#a70e1f] shadow-lg shadow-[#ce1226]/40 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              {copy.hero.secondaryCta}
            </NavLink>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#d6b209]">
              {copy.featuresHeading}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">{copy.featuresSubtitle}</p>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {copy.features.map((feature) => (
              <div key={feature.title} className="text-center p-6 bg-gray-900 rounded-lg border border-[#d6b209]/30">
                <h3 className="text-xl font-bold text-[#d6b209]">{feature.title}</h3>
                <p className="mt-2 text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-br from-[#020817] via-black to-[#012d62] py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#d6b209]">{copy.newsletter.eyebrow}</p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">{copy.newsletter.heading}</h2>
          <p className="mt-4 text-lg text-gray-300">{copy.newsletter.description}</p>
          <form className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-4" onSubmit={handleNewsletterSubmit}>
            <label htmlFor="newsletter-email" className="sr-only">
              {copy.newsletter.placeholder}
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder={copy.newsletter.placeholder}
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              required
              className="w-full sm:w-2/3 rounded-xl border border-[#d6b209]/40 bg-black/60 px-6 py-3 text-white placeholder-gray-500 focus:border-[#d6b209] focus:ring-2 focus:ring-[#d6b209]/60 transition"
            />
            <button
              type="submit"
              disabled={newsletterStatus === 'submitting'}
              className="inline-flex items-center justify-center rounded-xl bg-[#d6b209] px-6 py-3 text-base font-semibold text-black shadow-lg shadow-[#d6b209]/30 hover:bg-[#b79807] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {newsletterButtonLabel}
            </button>
          </form>
          {newsletterStatus === 'error' && newsletterError && (
            <p className="mt-4 text-sm text-[#ffb3b3]">{newsletterError}</p>
          )}
          {newsletterStatus === 'success' && newsletterResult === 'success' && (
            <p className="mt-4 text-sm text-[#d6b209]">{newsletterCopy.successTitle}</p>
          )}
          {newsletterStatus === 'success' && newsletterResult === 'already' && (
            <p className="mt-4 text-sm text-[#d6b209]">{newsletterCopy.alreadyTitle}</p>
          )}
          {newsletterStatus === 'error' && newsletterError === copy.newsletter.reactivationMessage && (
            <p className="mt-4 text-sm text-[#ffb3b3]">{newsletterCopy.reactivationTitle}</p>
          )}
          <p className="mt-6 text-xs text-gray-400">{copy.newsletter.privacy}</p>
        </div>
      </div>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-40 rounded-xl px-5 py-3 shadow-xl border transition-opacity duration-300 ${
            toast.type === 'success'
              ? 'bg-[#13223e]/95 border-[#d6b209]/40 text-[#fef6cc]'
              : 'bg-[#3a1515]/95 border-[#ce1226]/40 text-[#ffdada]'
          }`}
        >
          <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default HomePage;