import { useEffect, useState } from 'react';
import type { PageSlug } from '../lib/pageDefaults';
import { pageDefaults } from '../lib/pageDefaults';

interface PageContentResponse<T> {
  content: T;
  updatedAt?: string;
}

export function usePageContent<T>(slug: PageSlug, defaultContent: T) {
  const [content, setContent] = useState<T>(defaultContent);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
    try {
      const response = await fetch(`/api/pages/${encodeURIComponent(slug)}`);
      if (response.status === 404) {
        if (isMounted) {
          setContent(defaultContent);
          setUpdatedAt(null);
        }
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
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setContent(defaultContent);
          setUpdatedAt(null);
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [slug, defaultContent]);

  return { content, updatedAt, isLoading, error };
}

