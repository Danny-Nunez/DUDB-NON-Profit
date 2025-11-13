
import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { pageDefaults } from '../lib/pageDefaults';
import { usePageContent } from '../hooks/usePageContent';

const COLLECT_CHECKOUT_URL =
  'https://collectcheckout.com/cart/checkout.php?cart_configuration_id=0f25b9e7-7011-49f5-bf8b-e610fe5b29cd';

const DonatePage: React.FC = () => {
  const { language } = useLanguage();
  const defaultContent = pageDefaults.donate;
  const { content } = usePageContent('donate', defaultContent);
  const copy = content[language as keyof typeof defaultContent] as (typeof defaultContent)['en'];
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

          <a
            href={COLLECT_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-12 py-4 text-lg font-semibold text-white bg-[#ce1226] hover:bg-[#a70e1f] transition-colors shadow-lg shadow-[#ce1226]/40"
          >
            {copy.donateButton}
          </a>
          <p className="mt-4 text-xs text-gray-500">{copy.donateHelper}</p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DonatePage;