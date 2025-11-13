
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { pageDefaults } from '../lib/pageDefaults';
import { usePageContent } from '../hooks/usePageContent';

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const defaultContent = pageDefaults.footer;
  const { content } = usePageContent('footer', defaultContent);
  const copy = content[language as keyof typeof defaultContent] as {
    tagline: string;
    socialLinks: { facebook: string; instagram: string; twitter: string };
  };

  return (
    <footer className="bg-black shadow-inner mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-6 text-gray-400 mb-4">
          <a
            href={copy.socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-[#d6b209] transition-colors"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.93 3.6 9.02 8.32 9.88v-6.99H8.08v-2.89h2.24V9.83c0-2.22 1.32-3.45 3.34-3.45.97 0 1.99.17 1.99.17v2.2h-1.12c-1.1 0-1.45.69-1.45 1.4v1.68h2.47l-.39 2.89h-2.08v6.99c4.72-.86 8.32-4.95 8.32-9.88Z" />
            </svg>
          </a>
          <a
            href={copy.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-[#d6b209] transition-colors"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10Zm-5 3.5A5.5 5.5 0 0 0 6.5 13 5.5 5.5 0 0 0 12 18.5 5.5 5.5 0 0 0 17.5 13 5.5 5.5 0 0 0 12 7.5Zm0 2A3.5 3.5 0 0 1 15.5 13 3.5 3.5 0 0 1 12 16.5 3.5 3.5 0 0 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm5.75-3.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
            </svg>
          </a>
          <a
            href={copy.socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-[#d6b209] transition-colors"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.46 3.99c-1.14.68-2.4 1.15-3.74 1.35a3.24 3.24 0 0 0-5.52 2.22c0 .25.03.5.08.73A9.22 9.22 0 0 1 4.1 4.72a3.23 3.23 0 0 0 1 4.3 3.2 3.2 0 0 1-1.46-.4v.04a3.24 3.24 0 0 0 2.6 3.18 3.28 3.28 0 0 1-.85.11c-.2 0-.42-.02-.61-.05a3.25 3.25 0 0 0 3.03 2.26 6.5 6.5 0 0 1-4.78 1.33 9.2 9.2 0 0 0 14.16-7.72c0-.14 0-.29-.01-.43a6.6 6.6 0 0 0 1.63-1.7c-.6.27-1.26.45-1.95.53.7-.42 1.24-1.08 1.5-1.86Z" />
            </svg>
          </a>
        </div>
        <p className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Dominicanos Unidos Baltimore. All rights reserved.
        </p>
         <p className="text-center text-gray-500 text-xs mt-2">
          {copy.tagline}
        </p>
      </div>
    </footer>
  );
};

export default Footer;