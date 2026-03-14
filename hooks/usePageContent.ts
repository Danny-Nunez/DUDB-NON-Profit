import { useEffect, useRef, useState } from 'react';
import type { PageSlug } from '../lib/pageDefaults';
import { pageDefaults } from '../lib/pageDefaults';

const LOAD_TIMEOUT_MS = 10_000;

interface PageContentResponse<T> {
  content: T;
  updatedAt?: string;
}

export function usePageContent<T>(slug: PageSlug, defaultContent: T) {
  const defaultContentRef = useRef(defaultContent);
  defaultContentRef.current = defaultContent;

  const [content, setContent] = useState<T>(defaultContent);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      setIsLoading(true);
      setError(null);

      const done = () => {
        if (isMounted) setIsLoading(false);
        if (timeoutId !== undefined) clearTimeout(timeoutId);
      };

      timeoutId = setTimeout(() => {
        timeoutId = undefined;
        if (!isMounted) return;
        setContent(defaultContentRef.current);
        setUpdatedAt(null);
        done();
      }, LOAD_TIMEOUT_MS);

      try {
        const response = await fetch(`/api/pages/${encodeURIComponent(slug)}`);
        if (response.status === 404) {
          if (isMounted) {
            setContent(defaultContentRef.current);
            setUpdatedAt(null);
          }
          done();
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to load page content');
        }
        const data = (await response.json()) as PageContentResponse<T>;
        if (isMounted) {
          setContent((data.content ?? pageDefaults[slug]) as T);
          setUpdatedAt(data.updatedAt ?? null);
        }
        done();
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setContent(defaultContentRef.current);
          setUpdatedAt(null);
          setError(err as Error);
        }
        done();
      }
    }

    load();

    return () => {
      isMounted = false;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [slug]);

  return { content, updatedAt, isLoading, error };
}

