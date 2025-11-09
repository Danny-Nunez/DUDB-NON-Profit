
import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';

const content = {
  en: {
    title: 'Support Our Mission',
    subtitle: 'Your contribution makes a difference.',
    whyHeading: 'Why Your Donation Matters',
    whyDescription:
      'Dominicans United of Baltimore is a volunteer-driven organization. 100% of your donations go directly toward funding our community programs, business workshops, cultural events, and support services. Your generosity helps us provide scholarships, support local entrepreneurs, and preserve the rich culture of the Dominican Republic right here in Baltimore.',
    tiers: [
      {
        amount: '$25',
        name: 'Cultural Seed',
        description: 'Supports materials for our youth cultural education programs.',
        color: 'text-[#012d62]',
      },
      {
        amount: '$50',
        name: 'Business Boost',
        description: 'Helps fund a workshop for a local Dominican entrepreneur.',
        color: 'text-[#ce1226]',
      },
      {
        amount: '$100',
        name: 'Community Builder',
        description: 'Contributes to the costs of organizing a major community event.',
        color: 'text-[#d6b209]',
      },
    ],
    closing:
      'Every dollar helps strengthen our community. Join us in building a brighter future.',
    donateButton: 'Donate Now',
    donateAlert: 'Redirecting to donation platform... (Demo)',
  },
  es: {
    title: 'Apoya Nuestra Misión',
    subtitle: 'Tu contribución marca la diferencia.',
    whyHeading: 'Por Qué Tu Donación Importa',
    whyDescription:
      'Dominicanos Unidos de Baltimore es una organización impulsada por voluntarios. El 100% de tus donaciones se destina directamente a financiar nuestros programas comunitarios, talleres de negocios, eventos culturales y servicios de apoyo. Tu generosidad nos ayuda a ofrecer becas, apoyar a emprendedores locales y preservar la rica cultura dominicana aquí mismo en Baltimore.',
    tiers: [
      {
        amount: '$25',
        name: 'Semilla Cultural',
        description: 'Apoya materiales para nuestros programas de educación cultural juvenil.',
        color: 'text-[#012d62]',
      },
      {
        amount: '$50',
        name: 'Impulso Empresarial',
        description: 'Ayuda a financiar un taller para un emprendedor dominicano local.',
        color: 'text-[#ce1226]',
      },
      {
        amount: '$100',
        name: 'Constructor Comunitario',
        description: 'Contribuye a los costos de organizar un gran evento comunitario.',
        color: 'text-[#d6b209]',
      },
    ],
    closing:
      'Cada dólar fortalece a nuestra comunidad. Únete a nosotros para construir un futuro más brillante.',
    donateButton: 'Haz Tu Donación',
    donateAlert: 'Redirigiendo a la plataforma de donaciones... (Demostración)',
  },
} as const;

const DonatePage: React.FC = () => {
  const { language } = useLanguage();
  const copy = content[language];

  return (
    <PageWrapper title={copy.title} subtitle={copy.subtitle}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{copy.whyHeading}</h2>
          <p className="text-lg text-gray-300 mb-6">{copy.whyDescription}</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
            {copy.tiers.map((tier) => (
              <div key={`${tier.name}-${language}`} className="bg-gray-800/80 border border-[#012d62]/20 p-6 rounded-xl">
                <h3 className={`text-xl font-bold ${tier.color}`}>
                  {tier.amount} - {tier.name}
                </h3>
                <p className="text-gray-400 mt-2">{tier.description}</p>
              </div>
            ))}
          </div>

          <p className="text-lg text-gray-300 mb-8">{copy.closing}</p>

          <button
            className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-[#ce1226] hover:bg-[#a70e1f] transition-colors shadow-lg shadow-[#ce1226]/40"
            onClick={() => alert(copy.donateAlert)}
          >
            {copy.donateButton}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DonatePage;