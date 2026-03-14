import React, { useCallback, useEffect, useRef, useState } from 'react';

const VIDEO_SOURCES = ['/dance.mp4', '/group.mp4', '/waving.mp4'];
const FADE_DURATION_MS = 1500;

interface HeroVideoLayerProps {
  visible: boolean;
}

/**
 * Persistent hero video layer. Kept mounted so videos stay cached when navigating
 * away from home; hidden (not unmounted) when not on home route.
 */
const HeroVideoLayer: React.FC<HeroVideoLayerProps> = ({ visible }) => {
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const previousVideoRef = useRef<number | null>(null);
  const [firstVideoLoaded, setFirstVideoLoaded] = useState(false);

  const handleVideoEnd = useCallback((index: number) => {
    previousVideoRef.current = index;
    setActiveVideo((prev) => (index + 1) % VIDEO_SOURCES.length);
  }, []);

  useEffect(() => {
    if (!visible) {
      videoRefs.current.forEach((el) => {
        if (el) {
          el.pause();
        }
      });
      return;
    }
    const current = videoRefs.current[activeVideo];
    if (current) {
      current.currentTime = 0;
      current.play().catch(() => {});
    }
    const prev = previousVideoRef.current;
    if (prev !== null && prev !== activeVideo) {
      const prevEl = videoRefs.current[prev];
      if (prevEl) {
        prevEl.pause();
        const id = window.setTimeout(() => {
          prevEl.currentTime = 0;
          previousVideoRef.current = null;
        }, FADE_DURATION_MS);
        return () => clearTimeout(id);
      }
    }
  }, [visible, activeVideo]);

  return (
    <div
      className={`fixed inset-0 z-0 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none invisible'
      }`}
      aria-hidden="true"
    >
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-out ${
          firstVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {VIDEO_SOURCES.map((src, index) => (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[index] = el;
              if (el && index === 0 && !firstVideoLoaded) {
                el.currentTime = 0;
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
              activeVideo === index ? 'opacity-30' : 'opacity-0'
            }`}
            src={src}
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={() => {
              if (index === 0) {
                const first = videoRefs.current[0];
                if (first) {
                  first.currentTime = 0;
                  setFirstVideoLoaded(true);
                }
              }
            }}
            onEnded={() => handleVideoEnd(index)}
          />
        ))}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none h-80"
          style={{
            background:
              'linear-gradient(0deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 45%, rgba(0, 0, 0, 0.2) 75%, rgba(0, 0, 0, 0) 100%)',
          }}
        />
      </div>
    </div>
  );
};

export default HeroVideoLayer;
