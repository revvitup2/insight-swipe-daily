import { useEffect, useState } from 'react';

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const [debouncedCallback, setDebouncedCallback] = useState<() => void>();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedCallback) {
        debouncedCallback();
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedCallback, delay]);

  return (...args: Parameters<T>) => {
    setDebouncedCallback(() => () => callback(...args));
  };
};