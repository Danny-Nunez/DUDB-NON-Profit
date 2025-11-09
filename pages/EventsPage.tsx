import React from 'react';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';

const content = {
  en: {
    title: 'Community Events',
    subtitle: 'Bringing our people together to celebrate and grow.',
    events: [
      {
        name: 'Annual Dominican Cultural Festival',
        date: 'Upcoming: August 15, 2024',
        description:
          'Join us for our biggest event of the year! A full day of live music, traditional food, dancing, and activities for the whole family at Patterson Park.',
        imageUrl: 'https://picsum.photos/400/300?image=1015',
      },
      {
        name: 'Small Business Networking Night',
        date: 'Upcoming: September 5, 2024',
        description:
          'A quarterly event for Dominican entrepreneurs to connect, share resources, and build powerful partnerships. Hosted at Sabor Quisqueyano.',
        imageUrl: 'https://picsum.photos/400/300?image=1074',
      },
      {
        name: 'Community Health Fair',
        date: 'Upcoming: October 12, 2024',
        description:
          'Free health screenings, wellness information, and resources provided in partnership with local healthcare providers. Flu shots will be available.',
        imageUrl: 'https://picsum.photos/400/300?image=996',
      },
      {
        name: 'Holiday Toy Drive & Celebration',
        date: 'Past: December 20, 2023',
        description:
          'Our successful holiday event collected over 500 toys for children in the community, culminating in a festive celebration with music and food.',
        imageUrl: 'https://picsum.photos/400/300?image=1078',
      },
      {
        name: 'Financial Literacy Workshop',
        date: 'Past: July 8, 2023',
        description:
          'A workshop that provided valuable information on budgeting, saving, and investing for a secure financial future, attended by over 50 community members.',
        imageUrl: 'https://picsum.photos/400/300?image=23',
      },
      {
        name: 'Dominican Independence Day Gala',
        date: 'Past: February 27, 2023',
        description:
          'An elegant evening celebrating our heritage and honoring outstanding members of our community. A night of pride and unity.',
        imageUrl: 'https://picsum.photos/400/300?image=355',
      },
    ],
  },
  es: {
    title: 'Eventos Comunitarios',
    subtitle: 'Uniendo a nuestra gente para celebrar y crecer.',
    events: [
      {
        name: 'Festival Cultural Dominicano Anual',
        date: 'Próximo: 15 de agosto de 2024',
        description:
          '¡Acompáñanos en nuestro evento más grande del año! Un día completo de música en vivo, comida tradicional, baile y actividades para toda la familia en Patterson Park.',
        imageUrl: 'https://picsum.photos/400/300?image=1015',
      },
      {
        name: 'Noche de Networking para Negocios',
        date: 'Próximo: 5 de septiembre de 2024',
        description:
          'Evento trimestral para que emprendedores dominicanos se conecten, compartan recursos y construyan alianzas poderosas. Se realiza en Sabor Quisqueyano.',
        imageUrl: 'https://picsum.photos/400/300?image=1074',
      },
      {
        name: 'Feria de Salud Comunitaria',
        date: 'Próximo: 12 de octubre de 2024',
        description:
          'Exámenes de salud gratuitos, información de bienestar y recursos en colaboración con proveedores de salud locales. Se ofrecerán vacunas contra la gripe.',
        imageUrl: 'https://picsum.photos/400/300?image=996',
      },
      {
        name: 'Colecta de Juguetes y Celebración Navideña',
        date: 'Pasado: 20 de diciembre de 2023',
        description:
          'Recogimos más de 500 juguetes para los niños de la comunidad, culminando con una celebración festiva llena de música y comida.',
        imageUrl: 'https://picsum.photos/400/300?image=1078',
      },
      {
        name: 'Taller de Educación Financiera',
        date: 'Pasado: 8 de julio de 2023',
        description:
          'Brindó información valiosa sobre presupuesto, ahorro e inversión para un futuro financiero seguro. Asistieron más de 50 miembros de la comunidad.',
        imageUrl: 'https://picsum.photos/400/300?image=23',
      },
      {
        name: 'Gala del Día de la Independencia Dominicana',
        date: 'Pasado: 27 de febrero de 2023',
        description:
          'Una noche elegante celebrando nuestra herencia y reconociendo a miembros destacados de la comunidad. Una velada de orgullo y unidad.',
        imageUrl: 'https://picsum.photos/400/300?image=355',
      },
    ],
  },
} as const;

const EventsPage: React.FC = () => {
  const { language } = useLanguage();
  const copy = content[language];

  return (
    <PageWrapper title={copy.title} subtitle={copy.subtitle}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {copy.events.map((event) => (
          <Card
            key={`${event.name}-${language}`}
            imageUrl={event.imageUrl}
            title={event.name}
            subtitle={event.date}
            description={event.description}
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default EventsPage;

