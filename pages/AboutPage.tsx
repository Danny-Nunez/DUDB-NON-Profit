
import React from 'react';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';

const content = {
  en: {
    title: 'About Us',
    subtitle: 'Our Story, Our Mission, Our Vision',
    missionTitle: 'Our Mission',
    missionDescription:
      'To unite, empower, and uplift the Dominican community in Baltimore by fostering economic growth, providing essential support services, and celebrating our vibrant cultural heritage. We strive to create a network of solidarity where every member has the opportunity to succeed and thrive.',
    visionTitle: 'Our Vision',
    visionDescription:
      "We envision a future where the Dominican community is a recognized and influential force in Baltimore's economic and cultural landscape. A future where our businesses are prosperous, our families are strong, and our culture is a celebrated part of the city's diverse tapestry.",
    historyTitle: 'Our History',
    historyDescription:
      'Founded in 2023 by a group of passionate community leaders and business owners, Dominicanos Unidos Baltimore was born from a shared desire to address the needs of our growing community. We saw the immense talent, resilience, and entrepreneurial spirit of our people and wanted to create an organization that could amplify our collective voice and create tangible opportunities for success. From humble beginnings organizing small cultural gatherings, we have grown into a central resource for Dominican businesses and families across the region.',
    leadershipTag: 'Our Leadership',
    boardHeading: 'Board of Directors',
    boardDescription:
      'A diverse team of leaders committed to advancing the growth, culture, and well-being of the Dominican community in Baltimore.',
    boardMembers: [
      {
        name: 'Isabella Rodriguez',
        role: 'President & Co-Founder',
        description:
          'A visionary leader and successful restaurateur, Isabella founded the organization to create the community support she wished she had when starting her business.',
        imageUrl: 'https://picsum.photos/400/400?image=1027',
      },
      {
        name: 'Carlos Jimenez',
        role: 'Vice President',
        description:
          'With a background in finance and community development, Carlos oversees our strategic partnerships and financial health, ensuring our long-term impact.',
        imageUrl: 'https://picsum.photos/400/400?image=1005',
      },
      {
        name: 'Sofia Reyes',
        role: 'Secretary',
        description:
          'A community organizer at heart, Sofia manages our communications and outreach, ensuring our message reaches every corner of the community.',
        imageUrl: 'https://picsum.photos/400/400?image=1011',
      },
      {
        name: 'Mateo Castillo',
        role: 'Treasurer',
        description:
          "An experienced accountant, Mateo is dedicated to maintaining the organization's fiscal transparency and responsibility.",
        imageUrl: 'https://picsum.photos/400/400?image=836',
      },
      {
        name: 'Elena Vargas',
        role: 'Director of Business Development',
        description:
          'Elena is passionate about helping Dominican entrepreneurs succeed. She leads our business workshops and mentorship programs.',
        imageUrl: 'https://picsum.photos/400/400?image=823',
      },
      {
        name: 'Javier Peralta',
        role: 'Director of Cultural Events',
        description:
          'Javier is the creative force behind our vibrant cultural festivals, concerts, and community gatherings, celebrating our heritage with pride.',
        imageUrl: 'https://picsum.photos/400/400?image=64',
      },
    ],
  },
  es: {
    title: 'Sobre Nosotros',
    subtitle: 'Nuestra Historia, Nuestra Misión, Nuestra Visión',
    missionTitle: 'Nuestra Misión',
    missionDescription:
      'Unir, empoderar y elevar a la comunidad dominicana en Baltimore fomentando el crecimiento económico, brindando servicios esenciales y celebrando nuestro vibrante patrimonio cultural. Trabajamos para crear una red de solidaridad donde cada miembro tenga la oportunidad de prosperar.',
    visionTitle: 'Nuestra Visión',
    visionDescription:
      'Visualizamos un futuro en el que la comunidad dominicana sea una fuerza reconocida e influyente en el panorama económico y cultural de Baltimore. Un futuro donde nuestros negocios prosperen, nuestras familias sean fuertes y nuestra cultura sea una pieza celebrada del diverso tejido de la ciudad.',
    historyTitle: 'Nuestra Historia',
    historyDescription:
      'Fundada en 2023 por un grupo de líderes comunitarios y dueños de negocios apasionados, Dominicanos Unidos de Baltimore nació del deseo de atender las necesidades de nuestra creciente comunidad. Reconocimos el talento, la resiliencia y el espíritu emprendedor de nuestra gente y decidimos crear una organización que amplificara nuestra voz colectiva y generara oportunidades tangibles de éxito. De comienzos humildes organizando pequeños encuentros culturales, nos hemos convertido en un recurso central para los negocios y las familias dominicanas en toda la región.',
    leadershipTag: 'Nuestro Liderazgo',
    boardHeading: 'Junta Directiva',
    boardDescription:
      'Un equipo diverso de líderes comprometidos con impulsar el crecimiento, la cultura y el bienestar de la comunidad dominicana en Baltimore.',
    boardMembers: [
      {
        name: 'Isabella Rodriguez',
        role: 'Presidenta y Cofundadora',
        description:
          'Líder visionaria y exitosa restaurantera, Isabella fundó la organización para crear el apoyo comunitario que necesitó cuando inició su negocio.',
        imageUrl: 'https://picsum.photos/400/400?image=1027',
      },
      {
        name: 'Carlos Jimenez',
        role: 'Vicepresidente',
        description:
          'Con experiencia en finanzas y desarrollo comunitario, Carlos supervisa nuestras alianzas estratégicas y salud financiera para asegurar nuestro impacto a largo plazo.',
        imageUrl: 'https://picsum.photos/400/400?image=1005',
      },
      {
        name: 'Sofia Reyes',
        role: 'Secretaria',
        description:
          'Organizadora comunitaria de corazón, Sofía dirige nuestras comunicaciones y alcance, garantizando que nuestro mensaje llegue a toda la comunidad.',
        imageUrl: 'https://picsum.photos/400/400?image=1011',
      },
      {
        name: 'Mateo Castillo',
        role: 'Tesorero',
        description:
          'Contador experimentado, Mateo se dedica a mantener la transparencia y responsabilidad fiscal de la organización.',
        imageUrl: 'https://picsum.photos/400/400?image=836',
      },
      {
        name: 'Elena Vargas',
        role: 'Directora de Desarrollo Empresarial',
        description:
          'Elena se apasiona por ayudar a los emprendedores dominicanos a triunfar. Lidera nuestros talleres de negocios y programas de mentoría.',
        imageUrl: 'https://picsum.photos/400/400?image=823',
      },
      {
        name: 'Javier Peralta',
        role: 'Director de Eventos Culturales',
        description:
          'Javier es la fuerza creativa detrás de nuestros festivales, conciertos y encuentros comunitarios, celebrando nuestra herencia con orgullo.',
        imageUrl: 'https://picsum.photos/400/400?image=64',
      },
    ],
  },
} as const;

const AboutPage: React.FC = () => {
  const { language } = useLanguage();
  const copy = content[language];

  return (
    <PageWrapper title={copy.title} subtitle={copy.subtitle}>
      <div className="space-y-12 max-w-5xl mx-auto text-lg text-gray-300">
        <div className="bg-gray-900/60 border border-[#012d62]/30 backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-black/40">
          <h2 className="text-3xl font-bold text-[#012d62] mb-4 uppercase tracking-widest">{copy.missionTitle}</h2>
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