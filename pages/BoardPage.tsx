
import React from 'react';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';

const boardMembers = [
  {
    name: 'Isabella Rodriguez',
    role: 'President & Co-Founder',
    description: 'A visionary leader and successful restaurateur, Isabella founded the organization to create the community support she wished she had when starting her business.',
    imageUrl: 'https://picsum.photos/400/400?image=1027',
  },
  {
    name: 'Carlos Jimenez',
    role: 'Vice President',
    description: 'With a background in finance and community development, Carlos oversees our strategic partnerships and financial health, ensuring our long-term impact.',
    imageUrl: 'https://picsum.photos/400/400?image=1005',
  },
  {
    name: 'Sofia Reyes',
    role: 'Secretary',
    description: 'A community organizer at heart, Sofia manages our communications and outreach, ensuring our message reaches every corner of the community.',
    imageUrl: 'https://picsum.photos/400/400?image=1011',
  },
  {
    name: 'Mateo Castillo',
    role: 'Treasurer',
    description: 'An experienced accountant, Mateo is dedicated to maintaining the organization\'s fiscal transparency and responsibility.',
    imageUrl: 'https://picsum.photos/400/400?image=836',
  },
  {
    name: 'Elena Vargas',
    role: 'Director of Business Development',
    description: 'Elena is passionate about helping Dominican entrepreneurs succeed. She leads our business workshops and mentorship programs.',
    imageUrl: 'https://picsum.photos/400/400?image=823',
  },
  {
    name: 'Javier Peralta',
    role: 'Director of Cultural Events',
    description: 'Javier is the creative force behind our vibrant cultural festivals, concerts, and community gatherings, celebrating our heritage with pride.',
    imageUrl: 'https://picsum.photos/400/400?image=64',
  },
];

const BoardPage: React.FC = () => {
  return (
    <PageWrapper title="Our Board" subtitle="Meet the dedicated leaders shaping our community's future.">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {boardMembers.map((member) => (
          <Card
            key={member.name}
            imageUrl={member.imageUrl}
            title={member.name}
            subtitle={member.role}
            description={member.description}
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default BoardPage;
