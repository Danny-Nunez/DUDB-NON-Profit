
import React, { useState } from 'react';

interface CardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ imageUrl, title, subtitle, description }) => {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-1 transition-all duration-300">
      <div className="w-full h-56 bg-[#012d62]">
        {!hasImageError ? (
          <img
            className="w-full h-full object-cover"
            src={imageUrl}
            alt={title}
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/60 px-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#d6b209]">
              Imagen No Disponible
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        {subtitle && (
          <p className="text-sm font-semibold text-blue-400 mb-3">{subtitle}</p>
        )}
        <p className="text-gray-400 text-base">{description}</p>
      </div>
    </div>
  );
};

export default Card;