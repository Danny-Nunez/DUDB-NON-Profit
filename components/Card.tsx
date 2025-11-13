
import React, { useCallback, useMemo, useState } from 'react';

interface CardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  description: string;
  onClick?: () => void;
}

const VIDEO_REGEX = /\.(mp4|webm|ogg|mov)$/i;

const Card: React.FC<CardProps> = ({ imageUrl, title, subtitle, description, onClick }) => {
  const [hasMediaError, setHasMediaError] = useState(false);
  const isVideo = useMemo(() => VIDEO_REGEX.test(imageUrl), [imageUrl]);
  const prepareVideoPreview = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    // Allow the browser to choose the best preview frame
  }, []);

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className={`bg-gray-900 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 ${
        onClick
          ? 'hover:shadow-red-500/30 hover:-translate-y-1 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d6b209]'
          : ''
      }`}
    >
      <div className="w-full h-56 bg-[#012d62] overflow-hidden">
        {!hasMediaError ? (
          isVideo ? (
            <video
              ref={prepareVideoPreview}
              className="w-full h-full object-cover"
              src={imageUrl}
              muted
              playsInline
              preload="auto"
              onError={() => setHasMediaError(true)}
            />
          ) : (
            <img
              className="w-full h-full object-cover"
              src={imageUrl}
              alt={title}
              loading="lazy"
              onError={() => setHasMediaError(true)}
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/60 px-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#d6b209]">
              {isVideo ? 'Video No Disponible' : 'Imagen No Disponible'}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        {subtitle && (
          <p className="text-sm font-semibold text-blue-400 mb-3">{subtitle}</p>
        )}
        <p className="text-gray-400 text-base whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
};

export default Card;