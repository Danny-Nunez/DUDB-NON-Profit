import React from 'react';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';

const content = {
  en: {
    title: 'Business Directory',
    subtitle: 'Support our local Dominican-owned businesses.',
    businesses: [
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/96ZgGgZTmuuI7vVqu9CzWg/348s.jpg',
        name: 'El Merengue Restaurant',
        category: 'Dominican Restaurant',
        description:
          'Family spot serving classic Dominican dishes like pollo guisado, mangú, pernil, and pastelitos.',
      },
      {
        imageUrl: 'https://dominicanbrotherhood.com/uploads/1696218991_d06d0d9f46c100873cf4.png',
        name: 'Dominican Brotherhood Barbershop',
        category: 'Barbershop',
        description:
          'Popular Dominican barbershop offering fades, tapers, beard detailing, and kids cuts with urban culture flair.',
      },
      {
        imageUrl:
          'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxT1JJaJIPvnHBSDzWJQbSPJQotM06kxFKZr4XF6Tg8-1J0kiuO08X-4nyN4KpU2pFiEqD-yMHRsTwQKkYoHNRiRcf-YDktxvh6uhw5Zgo2aoDDXLCI_xGK-7b1zOcT0SkzP6Og7EDl_lvB=s1360-w1360-h1020-rw',
        name: 'El Punto Latino',
        category: 'Dominican Restaurant & Lounge',
        description:
          'Restaurant and nightlife lounge offering Dominican dishes, live music, and weekend dance events.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/qecHbWlAV1Fmx96MWqQLsg/348s.jpg',
        name: 'Mi Pueblo Market',
        category: 'Latin Grocery Store',
        description:
          'Local grocery offering Dominican spices, produce, frozen empanadas, and cultural everyday items.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/9Sb4Nqo6G0ygw2izkMaZxQ/348s.jpg',
        name: 'Picalonga Restaurant',
        category: 'Dominican Food Carry-Out',
        description:
          'Neighborhood takeout serving Dominican comfort foods like chimis, longaniza, and arroz con habichuelas.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/kAsHAtzkYOBpHDsEG23dSg/348s.jpg',
        name: 'Las Delicias Bakery & Café',
        category: 'Dominican Bakery',
        description:
          'Bakery known for pastelitos, bizcocho dominicano with dulce de leche, and fresh tropical juices.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/96ZgGgZTmuuI7vVqu9CzWg/348s.jpg',
        name: 'La Casa de los Chimis',
        category: 'Dominican Street Food',
        description:
          'Late-night chimis, tostones, hot dogs, and street style Dominican sandwiches with that authentic flavor.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/96ZgGgZTmuuI7vVqu9CzWg/348s.jpg',
        name: 'Dominican United of Baltimore',
        category: 'Community Cultural Organization',
        description:
          'Non-profit promoting Dominican culture, arts, and community development across Baltimore.',
      },
    ],
  },
  es: {
    title: 'Directorio de Negocios',
    subtitle: 'Apoya a nuestros negocios locales dirigidos por dominicanos.',
    businesses: [
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/96ZgGgZTmuuI7vVqu9CzWg/348s.jpg',
        name: 'Restaurante El Merengue',
        category: 'Restaurante Dominicano',
        description:
          'Lugar familiar que sirve platos clásicos dominicanos como pollo guisado, mangú, pernil y pastelitos.',
      },
      {
        imageUrl: 'https://dominicanbrotherhood.com/uploads/1696218991_d06d0d9f46c100873cf4.png',
        name: 'Barbería Dominican Brotherhood',
        category: 'Barbería',
        description:
          'Barbería dominicana popular que ofrece fades, tapers, diseño de barbas y cortes para niños con estilo urbano.',
      },
      {
        imageUrl:
          'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxT1JJaJIPvnHBSDzWJQbSPJQotM06kxFKZr4XF6Tg8-1J0kiuO08X-4nyN4KpU2pFiEqD-yMHRsTwQKkYoHNRiRcf-YDktxvh6uhw5Zgo2aoDDXLCI_xGK-7b1zOcT0SkzP6Og7EDl_lvB=s1360-w1360-h1020-rw',
        name: 'El Punto Latino',
        category: 'Restaurante y Lounge Dominicano',
        description:
          'Restaurante y lounge nocturno con platos dominicanos, música en vivo y eventos de baile los fines de semana.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/qecHbWlAV1Fmx96MWqQLsg/348s.jpg',
        name: 'Mi Pueblo Market',
        category: 'Supermercado Latino',
        description:
          'Mercado local con especias dominicanas, productos frescos, empanadas congeladas y artículos culturales cotidianos.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/9Sb4Nqo6G0ygw2izkMaZxQ/348s.jpg',
        name: 'Restaurante Picalonga',
        category: 'Comida Dominicana para Llevar',
        description:
          'Comida para llevar con los sabores de casa: chimis, longaniza y arroz con habichuelas.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/kAsHAtzkYOBpHDsEG23dSg/348s.jpg',
        name: 'Panadería y Café Las Delicias',
        category: 'Panadería Dominicana',
        description:
          'Panadería conocida por pastelitos, bizcocho dominicano con dulce de leche y jugos tropicales frescos.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/96ZgGgZTmuuI7vVqu9CzWg/348s.jpg',
        name: 'La Casa de los Chimis',
        category: 'Comida Callejera Dominicana',
        description:
          'Chimis nocturnos, tostones, hot dogs y sándwiches callejeros dominicanos con ese sabor auténtico.',
      },
      {
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/96ZgGgZTmuuI7vVqu9CzWg/348s.jpg',
        name: 'Dominicanos Unidos de Baltimore',
        category: 'Organización Cultural Comunitaria',
        description:
          'Sin fines de lucro que promueve la cultura dominicana, las artes y el desarrollo comunitario en Baltimore.',
      },
    ],
  },
} as const;

const BusinessesPage: React.FC = () => {
  const { language } = useLanguage();
  const copy = content[language];

  return (
    <PageWrapper title={copy.title} subtitle={copy.subtitle}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {copy.businesses.map((business) => (
          <Card
            key={`${business.name}-${language}`}
            imageUrl={business.imageUrl}
            title={business.name}
            subtitle={business.category}
            description={business.description}
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default BusinessesPage;

