
import React from 'react';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';
import { pageDefaults } from '../lib/pageDefaults';
import { usePageContent } from '../hooks/usePageContent';

const AboutPage: React.FC = () => {
  const { language } = useLanguage();
  const defaultContent = pageDefaults.about;
  const { content } = usePageContent('about', defaultContent);
  const copy = content[language as keyof typeof defaultContent] as (typeof defaultContent)['en'];

  return (
    <PageWrapper title={copy.title} subtitle={copy.subtitle}>
      <div className="space-y-12 max-w-5xl mx-auto text-lg text-gray-300">
        <div className="bg-gray-900/60 border border-[#012d62]/30 backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-black/40">
          <h2 className="text-3xl font-bold text-[#1b68c1] mb-4 uppercase tracking-widest">{copy.missionTitle}</h2>
          <p>{copy.missionDescription}</p>
        </div>

        <div className="bg-gray-900/60 border border-[#ce1226]/30 backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-black/40">
          <h2 className="text-3xl font-bold text-[#ce1226] mb-4 uppercase tracking-widest">{copy.visionTitle}</h2>
          <p>{copy.visionDescription}</p>
        </div>

        <div className="bg-gray-900/60 border border-[#d6b209]/30 backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-black/40">
          <h2 className="text-3xl font-bold text-[#d6b209] mb-4 uppercase tracking-widest">{copy.historyTitle}</h2>
          <p>{copy.historyDescription}</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[#d6b209]">{copy.leadershipTag}</p>
            <h2 className="mt-3 text-4xl font-extrabold text-white">{copy.boardHeading}</h2>
            <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">{copy.boardDescription}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {copy.boardMembers.map((member) => (
              <Card
                key={`${member.name}-${language}`}
                imageUrl={member.imageUrl}
                title={member.name}
                subtitle={member.role}
                description={member.description}
              />
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AboutPage;