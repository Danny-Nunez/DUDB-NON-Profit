
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const VIDEO_SOURCES = ['/dance.mp4', '/group.mp4'];
const FADE_DURATION_MS = 1500;

const content = {
  en: {
    hero: {
      lineOne: 'Uniting Our Community,',
      lineTwo: 'Strengthening Our Future.',
      description:
        'Dominicans United of Baltimore is a non-profit organization that promotes culture, art, social economics, and Dominican spiritual entrepreneurship in Baltimore and the surrounding areas. The organization is dedicated to fostering growth, support, and unity.',
      primaryCta: 'Learn More',
      secondaryCta: 'Support Us',
    },
    featuresHeading: 'Our Commitment',
    featuresSubtitle: 'We focus on three core pillars to uplift our community.',
    features: [
      {
        title: 'Business Empowerment',
        description:
          'Delivering resources, networking opportunities, and a platform for Dominican-owned businesses to thrive.',
      },
      {
        title: 'Community Support',
        description:
          'Organizing cultural events, workshops, and support programs that celebrate our heritage and serve our people.',
      },
      {
        title: 'Cultural Preservation',
        description:
          'Keeping our rich traditions alive through festivals, music, food, and educational events for all ages.',
      },
    ],
    newsletter: {
      eyebrow: 'Stay Connected',
      heading: 'Subscribe to Our Newsletter',
      description:
        'Receive updates on upcoming events, business resources, and new opportunities to get involved with the Dominican community in Baltimore.',
      placeholder: 'Enter your email address',
      cta: 'Subscribe',
      privacy: 'We respect your inbox. Expect 1–2 emails per month with community highlights.',
    },
  },
  es: {
    hero: {
      lineOne: 'Uniendo Nuestra Comunidad,',
      lineTwo: 'Fortaleciendo Nuestro Futuro.',
      description:
        'Dominicanos Unidos de Baltimore es una organización sin fines de lucro que promueve la cultura, el arte, la economía social y el emprendimiento espiritual dominicano en Baltimore y sus alrededores. Estamos dedicados a fomentar el crecimiento, el apoyo y la unidad.',
      primaryCta: 'Conoce Más',
      secondaryCta: 'Apóyanos',
    },
    featuresHeading: 'Nuestro Compromiso',
    featuresSubtitle: 'Nos enfocamos en tres pilares fundamentales para impulsar a nuestra comunidad.',
    features: [
      {
        title: 'Impulso Empresarial',
        description:
          'Ofrecemos recursos, oportunidades de networking y una plataforma para que los negocios dominicanos prosperen.',
      },
      {
        title: 'Apoyo Comunitario',
        description:
          'Organizamos eventos culturales, talleres y programas de apoyo que celebran nuestra herencia y sirven a nuestra gente.',
      },
      {
        title: 'Preservación Cultural',
        description:
          'Mantenemos vivas nuestras tradiciones a través de festivales, música, gastronomía y actividades educativas para todas las edades.',
      },
    ],
    newsletter: {
      eyebrow: 'Mantente Conectado',
      heading: 'Suscríbete a Nuestro Boletín',
      description:
        'Recibe noticias sobre eventos, recursos para negocios y nuevas oportunidades para involucrarte con la comunidad dominicana en Baltimore.',
      placeholder: 'Ingresa tu correo electrónico',
      cta: 'Suscribirme',
      privacy: 'Respetamos tu bandeja de entrada. Enviamos 1-2 correos al mes con lo más destacado de la comunidad.',
    },
  },
} as const;

const HomePage: React.FC = () => {
  const { language } = useLanguage();
  const copy = content[language];
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const previousVideoRef = useRef<number | null>(null);

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
          <form
            className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              alert(language === 'en' ? 'Subscribed! (Demo)' : '¡Suscripción realizada! (Demostración)');
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {copy.newsletter.placeholder}
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder={copy.newsletter.placeholder}
              className="w-full sm:w-2/3 rounded-xl border border-[#d6b209]/40 bg-black/60 px-6 py-3 text-white placeholder-gray-500 focus:border-[#d6b209] focus:ring-2 focus:ring-[#d6b209]/60 transition"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#d6b209] px-6 py-3 text-base font-semibold text-black shadow-lg shadow-[#d6b209]/30 hover:bg-[#b79807] transition"
            >
              {copy.newsletter.cta}
            </button>
          </form>
          <p className="mt-6 text-xs text-gray-400">{copy.newsletter.privacy}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;